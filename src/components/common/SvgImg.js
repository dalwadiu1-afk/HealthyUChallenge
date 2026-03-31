import React from 'react';
import { SvgXml } from 'react-native-svg';

export const SvgImg = ({ iconName, width, height, color, style, size }) => {
  // console.log(iconName);
  return (
    <SvgXml
      xml={iconName}
      width={size ? size : width}
      height={size ? size : height}
      stroke={color}
      style={style}
    />
  );
};
