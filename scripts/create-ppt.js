const pptxgen = require("pptxgenjs");
const path = require("path");

async function generatePitchPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";

  const slides = [
    {
      title: "Slide 1 - Title Cover",
      image: "C:\\Users\\vijay\\.gemini\\antigravity-ide\\brain\\74ba2251-9093-428a-9df3-64d626450949\\slide1_cover_1793636939589.jpg",
    },
    {
      title: "Slide 2 - End-to-End Autonomous Pipeline",
      image: "C:\\Users\\vijay\\.gemini\\antigravity-ide\\brain\\74ba2251-9093-428a-9df3-64d626450949\\slide2_architecture_1793637001870.jpg",
    },
    {
      title: "Slide 3 - Retail & Consumer Impact",
      image: "C:\\Users\\vijay\\.gemini\\antigravity-ide\\brain\\74ba2251-9093-428a-9df3-64d626450949\\slide3_value_1793637035163.jpg",
    },
    {
      title: "Slide 4 - Dual Telemetry: Skin & Scalp Trichology",
      image: "C:\\Users\\vijay\\.gemini\\antigravity-ide\\brain\\74ba2251-9093-428a-9df3-64d626450949\\slide4_hair_scalp_1793637265947.jpg",
    },
    {
      title: "Slide 5 - 1-Click Dermatologist Handoff PDF",
      image: "C:\\Users\\vijay\\.gemini\\antigravity-ide\\brain\\74ba2251-9093-428a-9df3-64d626450949\\slide5_dermatologist_handoff_1793637314815.jpg",
    },
    {
      title: "Slide 6 - The Future: AI Tele-Dermatology",
      image: "C:\\Users\\vijay\\.gemini\\antigravity-ide\\brain\\74ba2251-9093-428a-9df3-64d626450949\\slide6_future_vision_1793637417863.jpg",
    },
  ];

  for (const s of slides) {
    const slide = pres.addSlide();
    slide.background = { color: "06090E" };
    slide.addImage({
      path: s.image,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
    });
  }

  const outputPath = path.join(process.cwd(), "public", "Dermlog_Pitch_Deck.pptx");
  await pres.writeFile({ fileName: outputPath });
  console.log("Successfully generated presentation at:", outputPath);
}

generatePitchPresentation().catch(console.error);
