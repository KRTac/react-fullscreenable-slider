import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Slider, setModalAppElement } from '..';
import { getClassNameProps } from '../styles/css';
import { generateImgElements } from './assets/unsplash';
import './css/responsive.css';


export default {
  title: 'Examples/Responsive',
  component: Slider
} as ComponentMeta<typeof Slider>;

const imgChildren = generateImgElements();
setModalAppElement('#root');

const StandardTemplate: ComponentStory<typeof Slider> = ({ storyTop, ...props }) => {
  return (
    <div className="max-w-[1600px]">
      {storyTop}
      <Slider {...props}>
        {imgChildren}
      </Slider>
    </div>
  );
};

export const Default = StandardTemplate.bind({});
Default.args = {
  ...getClassNameProps('responsive'),
  onIndexChange: undefined,
  onLightboxIndexChange: undefined,
  withLightbox: true
};
Default.storyName = 'Default';

export const VisibleActive = StandardTemplate.bind({});
VisibleActive.args = {
  ...getClassNameProps('responsive visible-active'),
  onIndexChange: undefined,
  onLightboxIndexChange: undefined,
  withLightbox: true,
  storyTop: (
    <>
      <h1>Active and visible item classes</h1>
    </>
  )
};
VisibleActive.storyName = 'With visible and active items';

export const Gapped = StandardTemplate.bind({});
Gapped.args = {
  ...getClassNameProps('responsive gap'),
  onIndexChange: undefined,
  onLightboxIndexChange: undefined,
  withLightbox: true
};
Gapped.storyName = 'With item gap';
