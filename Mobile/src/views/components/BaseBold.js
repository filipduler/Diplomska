import React from 'react';
import { Text } from 'react-native';

const BaseBold = (props) => <Text style={[props.style, {fontWeight: 'bold'}]}>{props.children}</Text>

export default BaseBold;