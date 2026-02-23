import os
from ldap3 import Server, Connection, ALL, NTLM, SIMPLE, SUBTREE
from ldap3.core.exceptions import LDAPException, LDAPBindError, LDAPSocketOpenError


class LDAPConnectionError(Exception):
    """Raised when LDAP server is unreachable."""
    pass


class LDAPAuthService:
    """
    Service for authenticating users against LDAP directories.
    Supports both Active Directory (NTLM) and OpenLDAP (SIMPLE bind).
    """

    def __init__(self):
        self.server_url = os.getenv('LDAP_SERVER', 'ldap://localhost')
        self.port = int(os.getenv('LDAP_PORT', '389'))
        self.use_ssl = os.getenv('LDAP_USE_SSL', 'false').lower() == 'true'
        self.base_dn = os.getenv('LDAP_BASE_DN', '')
        self.user_search_base = os.getenv('LDAP_USER_SEARCH_BASE', self.base_dn)
        self.bind_user = os.getenv('LDAP_BIND_USER', '')
        self.bind_password = os.getenv('LDAP_BIND_PASSWORD', '')
        self.user_filter = os.getenv('LDAP_USER_FILTER', '(sAMAccountName={username})')
        self.domain = os.getenv('LDAP_DOMAIN', '')

        # For OpenLDAP: template to construct user DN for binding
        # Example: "cn={username},ou=Users,dc=test,dc=local"
        # If not set, uses DOMAIN\username (AD) or just username
        self.user_dn_template = os.getenv('LDAP_USER_DN_TEMPLATE', '')

        # Attribute names (differ between AD and OpenLDAP)
        # AD: sAMAccountName, displayName
        # OpenLDAP: uid or cn, displayName or cn
        self.username_attr = os.getenv('LDAP_USERNAME_ATTR', 'sAMAccountName')
        self.display_name_attr = os.getenv('LDAP_DISPLAY_NAME_ATTR', 'displayName')

        self.server = Server(
            self.server_url,
            port=self.port,
            use_ssl=self.use_ssl,
            get_info=ALL
        )

    def authenticate(self, username: str, password: str) -> dict | None:
        """
        Authenticate user against LDAP directory.

        Returns:
            dict with user info if successful: {'username': str, 'display_name': str}
            None if authentication fails
        """
        if not username or not password:
            return None

        try:
            # Determine bind credentials and auth method
            if self.user_dn_template:
                # OpenLDAP style: bind with full DN
                user_principal = self.user_dn_template.replace('{username}', username)
                auth_method = SIMPLE
            elif self.domain:
                # AD style: NTLM with DOMAIN\username
                user_principal = f"{self.domain}\\{username}"
                auth_method = NTLM
            else:
                # Fallback: simple bind with username
                user_principal = username
                auth_method = SIMPLE

            conn = Connection(
                self.server,
                user=user_principal,
                password=password,
                authentication=auth_method,
                auto_bind=True
            )

            # If bind succeeds, search for user details
            search_filter = self.user_filter.replace('{username}', username)
            conn.search(
                search_base=self.user_search_base,
                search_filter=search_filter,
                search_scope=SUBTREE,
                attributes=[self.username_attr, self.display_name_attr, 'cn', 'uid']
            )

            if conn.entries:
                entry = conn.entries[0]

                # Get display name (try configured attr, then cn, then username)
                display_name = username
                if hasattr(entry, self.display_name_attr) and getattr(entry, self.display_name_attr):
                    display_name = str(getattr(entry, self.display_name_attr))
                elif hasattr(entry, 'cn') and entry.cn:
                    display_name = str(entry.cn)

                # Get username (try configured attr, then uid, then cn)
                ldap_username = username
                if hasattr(entry, self.username_attr) and getattr(entry, self.username_attr):
                    ldap_username = str(getattr(entry, self.username_attr))
                elif hasattr(entry, 'uid') and entry.uid:
                    ldap_username = str(entry.uid)
                elif hasattr(entry, 'cn') and entry.cn:
                    ldap_username = str(entry.cn)

                conn.unbind()
                return {
                    'username': ldap_username,
                    'display_name': display_name
                }

            conn.unbind()
            # Bind succeeded but no entry found - return basic info
            return {'username': username, 'display_name': username}

        except LDAPBindError:
            # Invalid credentials
            return None
        except LDAPSocketOpenError as e:
            raise LDAPConnectionError(f"Cannot connect to LDAP server: {e}")
        except LDAPException as e:
            raise LDAPConnectionError(f"LDAP error: {e}")

    def test_connection(self) -> bool:
        """Test LDAP server connectivity using service account."""
        try:
            if self.bind_user and self.bind_password:
                conn = Connection(
                    self.server,
                    user=self.bind_user,
                    password=self.bind_password,
                    auto_bind=True
                )
                conn.unbind()
                return True
            return False
        except LDAPException:
            return False


# Singleton instance
ldap_service = LDAPAuthService()
