import { normalizePhone, startStkPush, waitForPayment } from "@/lib/mpesa";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Phase =
  | "input"
  | "sending"
  | "awaiting"
  | "success"
  | "failed"
  | "timeout";

type Props = {
  visible: boolean;
  amount: number; // whole shillings, from the cart
  onClose: () => void;
  onPaid: (info: { checkoutRequestId: string; receipt?: string }) => void;
};

const MpesaPaymentModal = ({ visible, amount, onClose, onPaid }: Props) => {
  const [phone, setPhone] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("input");
  const [message, setMessage] = React.useState("");
  const [receipt, setReceipt] = React.useState<string | undefined>();

  // Stops polling if the modal/screen unmounts mid-payment.
  const unmounted = React.useRef(false);
  React.useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  const busy = phase === "sending" || phase === "awaiting";
  const formatted = `Ksh.${amount.toLocaleString()}`;

  const handleClose = () => {
    if (busy) return; // a prompt is already on the customer's phone
    if (phase !== "success") {
      setPhase("input");
      setMessage("");
    }
    onClose();
  };

  const handlePay = async () => {
    if (busy) return;

    const msisdn = normalizePhone(phone);
    if (!msisdn) {
      setMessage("Enter a valid Safaricom number, e.g. 0712 345 678");
      return;
    }
    if (amount <= 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setMessage("");
    setReceipt(undefined);
    setPhase("sending");

    try {
      const checkoutRequestId = await startStkPush({
        phone: msisdn,
        amount,
        accountReference: `ORD${Date.now().toString().slice(-8)}`, // max 12 chars
        description: "Food order", // max 13 chars
      });

      setPhase("awaiting");
      const outcome = await waitForPayment(
        checkoutRequestId,
        () => unmounted.current,
      );
      if (unmounted.current) return;

      if (outcome.status === "success") {
        setReceipt(outcome.receipt);
        setPhase("success");
        onPaid({ checkoutRequestId, receipt: outcome.receipt });
      } else if (outcome.status === "failed") {
        setPhase("failed");
        setMessage(outcome.message);
      } else {
        setPhase("timeout");
        setMessage(
          "We haven't received confirmation yet. Check your M-Pesa messages before trying again, in case the payment went through.",
        );
      }
    } catch (e: any) {
      if (unmounted.current) return;
      setPhase("failed");
      setMessage(
        e?.message || "Network error. Check your connection and try again.",
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {phase === "success" ? (
            <View style={styles.centered}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.title}>Payment received</Text>
              {!!receipt && <Text style={styles.body}>Receipt: {receipt}</Text>}
              <Pressable style={styles.primaryBtn} onPress={handleClose}>
                <Text style={styles.primaryText}>Done</Text>
              </Pressable>
            </View>
          ) : busy ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#FF8F3A" />
              <Text style={styles.title}>
                {phase === "sending"
                  ? "Sending request..."
                  : "Check your phone"}
              </Text>
              <Text style={styles.body}>
                {phase === "sending"
                  ? "Setting up your M-Pesa payment."
                  : `Enter your M-Pesa PIN to pay ${formatted}.`}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Pay with M-Pesa</Text>
              <Text style={styles.body}>
                We'll send a payment prompt to your phone for{" "}
                <Text style={styles.bold}>{formatted}</Text>.
              </Text>

              <Text style={styles.label}>M-Pesa phone number</Text>
              <TextInput
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (message) setMessage("");
                }}
                placeholder="0712 345 678"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={16}
                style={styles.input}
              />

              {!!message && <Text style={styles.error}>{message}</Text>}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={handlePay}
              >
                <Text style={styles.primaryText}>
                  {phase === "input" ? `Pay ${formatted}` : "Try again"}
                </Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={handleClose}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  handle: {
    width: 45,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 8,
  },
  centered: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  successIcon: { fontSize: 48, color: "#2ecc71" },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  body: { fontSize: 14, color: "#555", lineHeight: 20, textAlign: "center" },
  bold: { fontWeight: "700", color: "#111" },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginTop: 4 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },
  error: { fontSize: 13, color: "#c0392b", lineHeight: 18 },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FF8F3A",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginTop: 4,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: { height: 44, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: "#666", fontSize: 14, fontWeight: "600" },
});

export default MpesaPaymentModal;
