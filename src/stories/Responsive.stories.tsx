import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Slider } from '..';
import { getClassNameProps } from '../styles/css';
import { generateImgElements } from './assets/unsplash';
import './css/responsive.css';


export default {
  title: 'Examples/Responsive',
  component: Slider
} as ComponentMeta<typeof Slider>;

const imgChildren = generateImgElements();

const StandardTemplate: ComponentStory<typeof Slider> = (props) => {
  return (
    <div style={{ width: '100%', maxWidth: '1110px', margin: '0 auto' }}>
      <Slider {...props}>
        {imgChildren}
      </Slider>
    </div>
  );
};

export const Default = StandardTemplate.bind({});
Default.args = {
  ...getClassNameProps(),
  onIndexChange: undefined
};
