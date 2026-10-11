import ProfileRow from "@/components/ProfileRow";
import { isAdmin } from "@/lib/orders";
import { router } from "expo-router";
import React from "react";

// Drop <AdminOrdersLink /> anywhere (e.g. the profile screen).
// It renders nothing unless the signed-in account has the "admin" label.
const AdminOrdersLink = () => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    isAdmin().then((ok) => alive && setShow(ok));
    return () => {
      alive = false;
    };
  }, []);

  if (!show) return null;

  return (
    <ProfileRow
      icon="settings"
      label="Manage orders"
      subtitle="Update order statuses (admin)"
      onPress={() => router.push("/admin/orders" as any)}
    />
  );
};

export default AdminOrdersLink;
