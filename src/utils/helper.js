import { Dimensions } from 'react-native';

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;
const { width, height } = Dimensions.get('window');

const scale = size => (width / guidelineBaseWidth) * size;

export { scale };
