require('@testing-library/jest-dom');

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

window.ResizeObserver =
  window.ResizeObserver ||
  function () {
    return {
      observe: function () {},
      unobserve: function () {},
      disconnect: function () {},
    };
  };

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

global.window.electronAPI = {
  generation: {
    textToImage: jest.fn(),
    imageToImage: jest.fn(),
    textToVideo: jest.fn(),
  },
};
