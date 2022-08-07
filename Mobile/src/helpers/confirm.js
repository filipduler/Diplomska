import { Alert } from "react-native";

const OpenConfirm = (title, message, confirmText, confirmCallback) =>
	Alert.alert(
		title,
		message,
		[
			{
				text: "Cancel",
				style: "cancel"
			},
			{ text: confirmText, onPress: () => confirmCallback() }
		]
	);

export default OpenConfirm;