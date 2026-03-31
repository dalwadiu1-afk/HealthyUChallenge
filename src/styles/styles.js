import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constant/colors';
import { scale } from '../utils/helper';

const width = Dimensions.get('screen').width;

const globalStyle = StyleSheet.create({
  IBMainContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: scale(27.5),
    backgroundColor: '#494358',
  },
  IBTextInput: {
    flex: 1,
    color: colors.dark,
    fontSize: scale(14),
    lineHeight: scale(20),
    paddingVertical: scale(15),
    paddingHorizontal: scale(15),
    borderColor: colors.outline,
  },
  disableIBTextInput: {
    color: colors.grey,
    backgroundColor: colors.lightBackground,
  },
});

export default globalStyle;
