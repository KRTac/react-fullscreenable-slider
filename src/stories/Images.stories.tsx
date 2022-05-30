import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { FullscreenableSlider as FsSlider } from '..';
import { generateImgElements } from './assets/unsplash';


export default {
  title: 'Examples/Images',
  component: FsSlider
} as ComponentMeta<typeof FsSlider>;

const StandardTemplate: ComponentStory<typeof FsSlider> = (props) => {
  return (
    <FsSlider {...props}>
      {generateImgElements()}
    </FsSlider>
  );
};

export const Default = StandardTemplate.bind({});
Default.args = {};
