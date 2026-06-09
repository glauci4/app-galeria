// app/(tabs)/mapa.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert, Image, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { getAllPhotos, Photo } from '../database/repositorios/fotos.repositorio';
import { Cores } from '../style/cores';
import { formatarCoordenadas, formatarData } from '../../utils/formatadores';

const REGIAO_INICIAL: Region = {
  latitude: -15.7801,
  longitude: -47.9292,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

// Tipos de cluster 

interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  fotos: Photo[];
}

// Algoritmo de cluster manual (Agrupa marcadores que estão a menos de `raioGraus` de distância entre si)
// raioGraus varia com o zoom: quanto mais afastado, maior o raio de agrupamento.

function calcularClusters(fotos: Photo[], latDelta: number): Cluster[] {
  // Raio de agrupamento proporcional ao zoom (latitudeDelta)
  const raio = latDelta * 0.15;

  const usados = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < fotos.length; i++) {
    if (usados.has(i)) continue;

    const grupo: Photo[] = [fotos[i]];
    usados.add(i);

    for (let j = i + 1; j < fotos.length; j++) {
      if (usados.has(j)) continue;
      const dLat = Math.abs(fotos[i].latitude! - fotos[j].latitude!);
      const dLon = Math.abs(fotos[i].longitude! - fotos[j].longitude!);
      if (dLat < raio && dLon < raio) {
        grupo.push(fotos[j]);
        usados.add(j);
      }
    }

    // Centro do cluster = média das coordenadas
    const lat = grupo.reduce((s, f) => s + f.latitude!, 0) / grupo.length;
    const lon = grupo.reduce((s, f) => s + f.longitude!, 0) / grupo.length;

    clusters.push({
      id: `cluster-${i}`,
      latitude: lat,
      longitude: lon,
      fotos: grupo,
    });
  }

  return clusters;
}

// Componente principal da tela de mapa, mostrando os marcadores e clusters das fotos com localização 

export default function MapaScreen() {
  const [fotos, setFotos] = useState<Photo[]>([]);
  const [fotosComLocal, setFotosComLocal] = useState<Photo[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [regiao, setRegiao] = useState<Region>(REGIAO_INICIAL);
  const [mapRef, setMapRef] = useState<MapView | null>(null);

  useFocusEffect(useCallback(() => { carregarFotos(); }, []));

  async function carregarFotos() {
    try {
      const data = await getAllPhotos();
      setFotos(data);
      const comLocal = data.filter((p) => p.latitude != null && p.longitude != null);
      setFotosComLocal(comLocal);
      setClusters(calcularClusters(comLocal, REGIAO_INICIAL.latitudeDelta));
    } catch (err) {
      console.error('[Mapa] Erro:', err);
      Alert.alert('Erro', 'Não foi possível carregar as fotos para o mapa.');
    }
  }

  function onRegionChange(r: Region) {
    setRegiao(r);
    // Recalcula clusters ao mudar o zoom
    setClusters(calcularClusters(fotosComLocal, r.latitudeDelta));
  }

  function centralizarTodos() {
    if (!mapRef || fotosComLocal.length === 0) return;
    mapRef.fitToCoordinates(
      fotosComLocal.map((p) => ({ latitude: p.latitude!, longitude: p.longitude! })),
      { edgePadding: { top: 80, right: 60, bottom: 80, left: 60 }, animated: true }
    );
  }

  const semLocalCount = fotos.length - fotosComLocal.length;

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => setMapRef(ref)}
        style={styles.map}
        initialRegion={REGIAO_INICIAL}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
      >
        {clusters.map((cluster) => {
          const unico = cluster.fotos.length === 1;
          const foto = cluster.fotos[0];

          if (unico) {
            // Marcador simples
            return (
              <Marker
                key={cluster.id}
                coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerBubble}>
                    <Image source={{ uri: foto.image_uri }} style={styles.markerImage} />
                  </View>
                  <View style={styles.markerArrow} />
                </View>

                <Callout style={styles.callout} tooltip>
                  <View style={styles.calloutContent}>
                    <Image source={{ uri: foto.image_uri }} style={styles.calloutImage} />
                    <View style={styles.calloutInfo}>
                      <Text style={styles.calloutTitle} numberOfLines={2}>{foto.title}</Text>
                      <Text style={styles.calloutDate}>{formatarData(foto.created_at)}</Text>
                      <Text style={styles.calloutCoords}>
                        {formatarCoordenadas(foto.latitude!, foto.longitude!)}
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          }

          // Marcador de cluster 
          return (
            <Marker
              key={cluster.id}
              coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
            >
              <View style={styles.clusterBubble}>
                <Text style={styles.clusterNumero}>{cluster.fotos.length}</Text>
              </View>

              <Callout style={styles.callout} tooltip>
                <View style={styles.calloutContent}>
                  {/* Mostra miniatura da primeira foto do cluster */}
                  <Image source={{ uri: cluster.fotos[0].image_uri }} style={styles.calloutImage} />
                  <View style={styles.calloutInfo}>
                    <Text style={styles.calloutTitle}>
                      {cluster.fotos.length} itens nesta área
                    </Text>
                    <Text style={styles.calloutDate} numberOfLines={1}>
                      Ex: {cluster.fotos[0].title}
                    </Text>
                    <Text style={styles.calloutCoords}>
                      {formatarCoordenadas(cluster.latitude, cluster.longitude)}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Ionicons name="location" size={16} color={Cores.destaque} />
        <Text style={styles.infoText}>
          {fotosComLocal.length} foto{fotosComLocal.length !== 1 ? 's' : ''} no mapa
          {semLocalCount > 0 ? ` · ${semLocalCount} sem GPS` : ''}
          {clusters.length < fotosComLocal.length
            ? ` · ${clusters.length} grupo${clusters.length !== 1 ? 's' : ''}`
            : ''}
        </Text>
      </View>

      {/* Botão centralizar */}
      {fotosComLocal.length > 0 && (
        <TouchableOpacity style={styles.fitButton} onPress={centralizarTodos}>
          <Ionicons name="expand-outline" size={22} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Estados vazios */}
      {fotos.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="map-outline" size={56} color="#fff" />
          <Text style={styles.emptyText}>Nenhuma foto cadastrada</Text>
          <Text style={styles.emptySubtext}>Adicione fotos na aba Galeria</Text>
        </View>
      )}
      {fotos.length > 0 && fotosComLocal.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="location-outline" size={56} color="#fff" />
          <Text style={styles.emptyText}>Nenhuma foto com localização</Text>
          <Text style={styles.emptySubtext}>
            Permita acesso à localização ao adicionar fotos
          </Text>
        </View>
      )}
    </View>
  );
}

// Estilos

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Marcador simples
  markerContainer: { alignItems: 'center' },
  markerBubble: {
    width: 50, height: 50, borderRadius: 25,
    overflow: 'hidden', borderWidth: 3,
    borderColor: Cores.destaque, backgroundColor: '#111',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
  },
  markerImage: { width: '100%', height: '100%' },
  markerArrow: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: Cores.destaque, marginTop: -1,
  },

  // Marcador de cluster
  clusterBubble: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Cores.destaque,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
  },
  clusterNumero: {
    color: '#fff', fontSize: 16, fontWeight: '800',
  },

  // Callout
  callout: { width: 220 },
  calloutContent: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', flexDirection: 'row',
    padding: 8, gap: 8, elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  calloutImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
  calloutInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  calloutTitle: { fontSize: 13, fontWeight: '700', color: '#111' },
  calloutDate: { fontSize: 11, color: '#666' },
  calloutCoords: {
    fontSize: 10, color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Info card
  infoCard: {
    position: 'absolute', top: 16, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', gap: 6,
  },
  infoText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Botão centralizar
  fitButton: {
    position: 'absolute', bottom: 32, right: 16,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Cores.destaque,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 5,
  },

  // Estados vazios
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 40,
  },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtext: { color: '#ccc', fontSize: 13, textAlign: 'center' },
});