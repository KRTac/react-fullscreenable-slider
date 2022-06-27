import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Slider } from '..';
import { getClassNameProps } from '../styles/css';
import { generateImgElements } from './assets/unsplash';


export default {
  title: 'Examples/Single slide',
  component: Slider
} as ComponentMeta<typeof Slider>;

const imgChildren = generateImgElements();
const childNum = imgChildren.length;

const ControlledTemplate: ComponentStory<typeof Slider> = (props) => {
  const [ activeIdx, setActiveIdx ] = useState(0);

  return (
    <div className="max-w-[1110px]">
      <Slider {...props} index={activeIdx} onIndexChange={setActiveIdx}>
        {imgChildren}
      </Slider>
      <p className="flex items-center flex-col md:flex-row justify-between my-6 flex-wrap max-w-sm mx-auto">
        <button onClick={() => {
          setActiveIdx((activeIdx + childNum - 1) % childNum);
        }}>
          Previous
        </button>
        <span className="my-2">Active slide: {activeIdx + 1}</span>
        <button
          onClick={() => setActiveIdx((activeIdx + 1) % childNum)}
        >
          Next
        </button>
      </p>
    </div>
  );
};

export const Controlled = ControlledTemplate.bind({});
Controlled.args = {
  ...getClassNameProps(),
  onIndexChange: undefined,
  onLightboxIndexChange: undefined,
  withLightbox: true
};
Controlled.storyName = 'Controlled component';
