import React, { useState, useCallback } from "react";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroTrackingStateConstants,
  ViroNode,
  ViroPolyline,
  ViroMaterials,
} from "@reactvision/react-viro";
import { StyleSheet } from "react-native";

// Create the material
ViroMaterials.createMaterials({
  line: {
    diffuseColor: "#FF0000",
  },
});

const MeasureDistanceSceneAR = () => {
  const [text, setText] = useState("Initializing AR...");
  const [points, setPoints] = useState<[number, number, number][]>([]);
  const [distance, setDistance] = useState(0);

  const onInitialized = useCallback((state, reason) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText("Tap to place points");
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setText("Tracking unavailable. Please adjust your device.");
    }
  }, []);

  const onClick = useCallback((event) => {
    console.log("Event object:", event);
    const position = Array.isArray(event)
      ? event
      : event.nativeEvent.position || event.position || event;
    if (!Array.isArray(position) || position.length !== 3) {
      console.error("Position data is missing or invalid in the event");
      return;
    }

    setPoints((prevPoints) => {
      if (prevPoints.length >= 2) return prevPoints; // Prevent adding more than 2 points

      const newPoints = [...prevPoints, position];
      if (newPoints.length === 2) {
        const [p1, p2] = newPoints;
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dz = p2[2] - p1[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        setDistance(dist);
        setText(`Distance: ${dist.toFixed(2)} meters`);
      }
      return newPoints;
    });
  }, []);

  const resetMeasurement = () => {
    setPoints([]);
    setDistance(0);
    setText("Tap to place points");
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroText
        text={text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
      {points.length === 2 && (
        <ViroPolyline
          position={[0, 0, 0]}
          points={points}
          thickness={0.01}
          materials={["line"]}
        />
      )}
      <ViroNode position={[0, 0, -1]} onClick={onClick}>
        <ViroText
          text="Tap to measure"
          scale={[0.5, 0.5, 0.5]}
          position={[0, -0.5, 0]}
          style={styles.helloWorldTextStyle}
        />
      </ViroNode>
      <ViroNode position={[0, 0, -1]} onClick={resetMeasurement}>
        <ViroText
          text="Reset"
          scale={[0.5, 0.5, 0.5]}
          position={[0, -1, 0]}
          style={styles.helloWorldTextStyle}
        />
      </ViroNode>
    </ViroARScene>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: MeasureDistanceSceneAR,
      }}
      style={styles.f1}
    />
  );
};

var styles = StyleSheet.create({
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});
