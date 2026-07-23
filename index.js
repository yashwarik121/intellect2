import {AppRegistry} from 'react-native';
import MainStackNavigation from './src/navigations/mainStackNavigation';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => MainStackNavigation);
