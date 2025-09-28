import { View, Text } from "react-native";
import React from "react";
import { Colors } from "react-native-ui-lib";

type Props = {
  title: string;
  body: React.ReactNode;
  icon?: React.ReactNode;
};

const GeneralInfoCard = ({ title, body, icon }: Props) => {
  return (
    <View
      style={{
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 12, // Increased for smoother corners
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: Colors.white, // Light border for smoothness
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.09,
        shadowRadius: 1,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
        {icon && <View>{icon}</View>}
      </View>

      {/* body pode ser texto simples ou qualquer JSX */}
      {typeof body === "string" ? (
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginTop: 4,
            lineHeight: 28,
            color: Colors.blue20,
          }}
        >
          {body}
        </Text>
      ) : (
        body
      )}
    </View>
  );
};

export default GeneralInfoCard;
