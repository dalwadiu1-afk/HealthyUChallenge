import { Dimensions, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../../constant/colors';
import globalStyle from '../../styles/styles';
import { filterIcon, searchIcon } from '../../assets/images';
import { fontFamily } from '../../constant';
import { SvgImg } from './SvgImg';

const { height, width } = Dimensions.get('window');

export const SearchBar = ({ searchText, searchHandler }) => {
  return (
    <View style={globalStyle.IBMainContainer}>
      <View style={styles.searchIconContainer}>
        <SvgImg iconName={searchIcon()} height={30} width={30} />
      </View>
      <TextInput
        placeholder={'Search friends or neighbors'}
        placeholderTextColor={colors.white}
        autoCorrect={false}
        value={searchText}
        onChangeText={searchHandler}
        style={{
          ...globalStyle.IBTextInput,
          ...styles.searchbar,
          fontFamily: fontFamily.montserratRegular,
        }}
      />
      <View style={styles.searchIconContainer}>
        <SvgImg iconName={filterIcon} height={28} width={28} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchbar: {
    color: colors.white,
    paddingHorizontal: 0,
  },
  searchIconContainer: {
    height: height * 0.065,
    width: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
