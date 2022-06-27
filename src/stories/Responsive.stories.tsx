import React, { useState } from 'react';
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

const NavigationTemplate: ComponentStory<typeof Slider> = ({ storyTop, ...props }) => {
  const [ triggers, setTriggers ] = useState([ 0, 0 ]);
  const [ index, setIndex ] = useState(0);

  return (
    <div className="max-w-[1600px]">
      {storyTop}
      <div className="flex items-center flex-col md:flex-row justify-between my-6 flex-wrap max-w-sm mx-auto">
        <button onClick={() => {
          setTriggers(prev => ([ prev[0] + 1, prev[1] ]));
        }}>
          Previous
        </button>
        <div className="flex flex-col text-center">
          <p>Active index: <strong>{index + 1}</strong></p>
          <p>Navigation target: <strong>{props.navigationTarget}</strong></p>
        </div>
        <button onClick={() => {
          setTriggers(prev => ([ prev[0], prev[1] + 1 ]));
        }}>
          Next
        </button>
      </div>
      <Slider
        {...props}
        index={index}
        onIndexChange={setIndex}
        navigationTriggers={triggers}
      >
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

export const Gapped = StandardTemplate.bind({});
Gapped.args = {
  ...getClassNameProps('responsive gap'),
  onIndexChange: undefined,
  onLightboxIndexChange: undefined,
  withLightbox: true
};
Gapped.storyName = 'With item gap';

export const Navigation = NavigationTemplate.bind({});
Navigation.args = {
  ...getClassNameProps('responsive visible-active'),
  onIndexChange: undefined,
  onLightboxIndexChange: undefined,
  withLightbox: true,
  navigationTarget: 'items',
  storyTop: (
    <>
      <h1>External navigation</h1>
      <p>Active and visible item example classes used.</p>
    </>
  )
};
Navigation.storyName = 'With external navigation';
