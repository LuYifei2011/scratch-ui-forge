import sansSerif from "scratch-render-fonts/src/NotoSans-Medium.ttf?url";
import serif from "scratch-render-fonts/src/SourceSerifPro-Regular.otf?url";
import handwriting from "scratch-render-fonts/src/handlee-regular.ttf?url";
import marker from "scratch-render-fonts/src/Knewave.ttf?url";
import curly from "scratch-render-fonts/src/Griffy-Regular.ttf?url";
import pixel from "scratch-render-fonts/src/Grand9K-Pixel.ttf?url";
import scratch from "scratch-render-fonts/src/Scratch.ttf?url";

const style = document.createElement("style");
style.textContent = `
  @font-face {
    font-family: 'Sans Serif';
    src: url('${sansSerif}') format('truetype');
  }
  @font-face {
    font-family: 'Serif';
    src: url('${serif}') format('opentype');
  }
  @font-face {
    font-family: 'Handwriting';
    src: url('${handwriting}') format('truetype');
  }
  @font-face {
    font-family: 'Marker';
    src: url('${marker}') format('truetype');
  }
  @font-face {
    font-family: 'Curly';
    src: url('${curly}') format('truetype');
  }
  @font-face {
    font-family: 'Pixel';
    src: url('${pixel}') format('truetype');
  }
  @font-face {
    font-family: 'Scratch';
    src: url('${scratch}') format('truetype');
  }
`;
document.head.appendChild(style);
