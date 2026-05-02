import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function DeleteAccount() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Eliminazione account</Text>

        <Text style={styles.text}>
          Puoi richiedere la cancellazione del tuo account CodeMaster Academy e
          di tutti i dati associati.
        </Text>

        <Text style={styles.subtitle}>Come richiedere l&apos;eliminazione</Text>

        <Text style={styles.text}>
          1. Accedi all&apos;app CodeMaster Academy.
        </Text>
        <Text style={styles.text}>
          2. Vai nella sezione Sicurezza del profilo.
        </Text>
        <Text style={styles.text}>
          3. Richiedi l&apos;eliminazione dell&apos;account.
        </Text>

        <Text style={styles.text}>
          In alternativa puoi inviare una richiesta via email a:
        </Text>

        <Text style={styles.email}>support@codemaster-academy.com</Text>

        <Text style={styles.text}>
          I dati dell&apos;account verranno eliminati entro 30 giorni dalla
          richiesta, salvo obblighi legali o fiscali che richiedano una
          conservazione più lunga.
        </Text>

        <Text style={styles.text}>
          Dopo l&apos;eliminazione, perderai l&apos;accesso ai corsi, ai
          progressi, ai certificati e agli eventuali dati collegati al tuo
          profilo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
    padding: 24,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 16,
  },
});