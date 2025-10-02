// Role-Based Access Control
export type Role = "admin" | "manager" | "operator";
export type Permission = 
  | "read_clients"
  | "write_clients" 
  | "read_accounts"
  | "write_accounts"
  | "read_metrics"
  | "write_metrics"
  | "manage_users"
  | "run_alerts"
  | "manage_settings";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "read_clients", "write_clients",
    "read_accounts", "write_accounts", 
    "read_metrics", "write_metrics",
    "manage_users",
    "run_alerts",
    "manage_settings"
  ],
  manager: [
    "read_clients", "write_clients",
    "read_accounts", "write_accounts",
    "read_metrics", "write_metrics", 
    "run_alerts"
  ],
  operator: [
    "read_clients",
    "read_accounts",
    "read_metrics"
  ]
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function requirePermission(userRole: Role, permission: Permission) {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`);
  }
}
