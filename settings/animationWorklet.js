export default {
  animation: {
    type: 'animation',
    console: true,
    name: 'AnimationWorklet',
    features: [],
    html: `<div id="my-elem">Hello World</div>`,
    css: `body {
  height: 200%;
}  
  
#my-elem {
  position: fixed;
}`,
    js: `// Element we want to animate
const elem = document.querySelector('#my-elem');
const scrollSource = document.scrollingElement;
const timeRange = 1000;
const scrollTimeline = new ScrollTimeline({
  scrollSource,
  timeRange,
});

const effectKeyframes = new KeyframeEffect(
  elem,
  [
    {transform: 'scale(1)'},
    {transform: 'scale(25)'},
    {transform: 'scale(1)'}
  ],
  {
    duration: timeRange,
  },
);

new WorkletAnimation(
  'sample-animator',
  effectKeyframes,
  scrollTimeline,
  {},
).play();`,
    worklet: `registerAnimator('sample-animator', class {
  constructor(options) {
    // Called when a new animator is instantiated
    // Used to set stuff up for each use of an animator
  }
  animate(currentTime, effect) {
    // currentTime - The current time from the defined timeline
    // effect - Group of effects that this animation is working on

    // Animation frame logic goes here.
    // Usually something to the effect of setting the time of an effect
    effect.localTime = currentTime;
  }
});`
  }
};