import { Alert } from "react-native";

const OpenConfirm = (message, title = "Server error") =>
Alert.alert(
	title,
	message,
	[
	  { text: "OK" }
	]
  );

export default OpenConfirm;