import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      <Tabs.Screen name="index" options={{ title: 'Galeria', tabBarIcon: ({ color, size }) => <Ionicons name="images-outline" size={size} color={color} />, headerTitle: 'Galeria' }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />, headerTitle: 'Mapa' }} />
    </Tabs>
  );
}