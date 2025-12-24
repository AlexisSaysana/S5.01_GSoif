import { View, Image, Text, StyleSheet } from 'react-native';
import { fonts } from '../styles/fonts';

const FountainTab = ({ name, location, distance, time, nearest }) => (
    <View
      style={
        {
          backgroundColor: 'white',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderRadius: 15,
          borderWidth: 2,
          borderColor: '#D9D9D9',
          padding: 15,
        }
      }
    >
      <View
      style={
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 2
        }
      }
    >
      <View
      style={
        {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        }
      }
      >
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/circle_blue.png')}
        />
      
      <Text
        style={
          {
            fontFamily: fonts.bricolageGrotesque,
            fontSize: 20,
            color: '#000000'
          }
          
        }
      >
        {
          name.length > 23
          ? name.substring(0,20) + '...'
          : name
        }
      </Text>
      </View>
      <Text
        style={
          {
            fontFamily: fonts.inter,
            fontSize: 12,
            color: '#4D4D4D',
            paddingLeft: 30,
          }
        }
      >
        { location }
      </Text>
      { nearest &&
      <View
      style={
        {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
        }
      }
      >
        <Image
          style={{width: 24, height: 24}}
          source={require('../assets/star_filled.png')}
        />
      <Text
        style={
          {
            fontFamily: fonts.inter,
            fontSize: 12,
            color: '#4D4D4D',
            marginLeft: -4,
            marginTop: 4,
          }
        }
      >
        Le plus proche
      </Text>
      </View>
      }
      </View>
      <View
      style={
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2
        }
      }
    >
      <Text
        style={
          {
            fontFamily: fonts.inter,
            fontSize: 18,
            color: '#575757',
            fontWeight: '700'
          }
        }
      >
        { distance }
      </Text>
      <View
      style={
        {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }
      }
      >
        <Image
          style={{width: 16, height: 16}}
          source={require('../assets/directions_walk.png')}
        />
      <Text
        style={
          {
            fontFamily: fonts.inter,
            fontSize: 12,
            color: '#575757'
          }
        }
      >
        { time }
      </Text>
      </View>
      </View>
    </View>
);

const styles = StyleSheet.create({
    input: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
        fontSize: 16,
        fontFamily: fonts.inter,
    },
});

export default FountainTab;