/*
import { I18nManager } from 'react-native'
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
*/

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
