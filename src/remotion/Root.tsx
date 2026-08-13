import { Composition } from "remotion";
import { AntigravityDemo } from "./AntigravityDemo";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AntigravityKakaoBankDemo"
        component={AntigravityDemo}
        durationInFrames={1380}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
