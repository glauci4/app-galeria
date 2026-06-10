import { Tabs } from 'expo-router';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Cores } from '../style/cores';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Cores.destaque,
        tabBarInactiveTintColor: Cores.textoSecundario,
        tabBarStyle: { backgroundColor: Cores.fundo, borderTopColor: Cores.borda, borderTopWidth: 1, paddingBottom: 6, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: Cores.fundo },
        headerTintColor: Cores.textoPrimario,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Galeria',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Fontisto name="photograph" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <Fontisto name="map" size={size} color={color} />,
          headerTitle: 'Mapa',
        }}
      />
    </Tabs>
  );
}