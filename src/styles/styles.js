import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constant/colors';
import { scale } from '../utils/helper';
import { fontFamily } from '../constant';

const width = Dimensions.get('screen').width;

const globalStyle = StyleSheet.create({
  IBMainContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: scale(27.5),
    backgroundColor: colors.secondary,
  },
  IBTextInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.interRegular,
  },
  disableIBTextInput: {
    color: colors.grey,
    // backgroundColor: colors.lightBackground,
  },
});

export default globalStyle;
