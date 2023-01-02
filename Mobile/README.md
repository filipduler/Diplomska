npx react-native run-android --verbose
adb -s emulator-5554 reverse tcp:1323 tcp:1323

adb devices
adb start-server
adb kill-server

https://reactnative.dev/docs/environment-setup