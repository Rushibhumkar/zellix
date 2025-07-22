import React, { useState } from "react";
import { View, StyleSheet,Text} from "react-native";
import { List } from "react-native-paper";


const ListAccordion = ({ title, children}) => {
  const [expanded, setExpanded] = useState(true);
  const handlePress = () => setExpanded(!expanded);
  return (
    <View style={{ padding: 20, marginTop: 0 }}>
      <List.Accordion
        title={title}
        style={styles.header}
        titleStyle={styles.title}
        expanded={expanded}
        onPress={handlePress}
      >
        {children}
      </List.Accordion>
     
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
     borderBottomWidth: 1,
     borderBottomColor: "#2D67C6",
     backgroundColor: "#ECECEC",
     paddingVertical: 0,
    
  },
  title: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "700",
  },
});

export default ListAccordion;
