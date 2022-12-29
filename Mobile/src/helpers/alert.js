import { Alert } from "react-native";

const ShowAlert = (message, title = "Server error") =>
	Alert.alert(
		title,
		message,
		[
			{ text: "OK" }
		]
	);

export default ShowAlert;