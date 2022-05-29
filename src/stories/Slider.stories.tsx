import React, { Children } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { FullscreenableSlider as FsSlider } from '..';


export default {
  title: 'Examples/Slider',
  component: FsSlider
} as ComponentMeta<typeof FsSlider>;

const StandardChildrenTemplate: ComponentStory<typeof FsSlider> = (props) => {
  return (
    <FsSlider {...props}>
      <div>Slide 1</div>
      <div key="withKey">Slide 2</div>
      <div>Slide 3</div>
      <div>Slide 4</div>
      <div>Slide 5</div>
      <div>Slide 6</div>
      <div>Slide 7</div>
      <div>Slide 8</div>
    </FsSlider>
  );
};

export const Default = StandardChildrenTemplate.bind({});
Default.args = {};

const ArrayTemplate: ComponentStory<typeof FsSlider> = (props) => {
  const body = [];

  for (let idx = 0; idx < 8; idx++) {
    body.push(<div key={`arrItem${idx}`}>Array slide {idx + 1}</div>);
  }

  return (
    <FsSlider {...props}>
      {body}
    </FsSlider>
  );
};

export const ChildrenArray = ArrayTemplate.bind({});
ChildrenArray.args = {
  disableLightbox: true
};
