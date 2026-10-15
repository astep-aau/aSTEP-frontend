'use client'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import styles from './map.module.css'

const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark'

const ROUTE_SOURCE_ID = 'route'
const ROUTE_LAYER_ID = 'route-line'

const toLngLat = ([lat, lng]: [number, number]): [number, number] => [lng, lat]

const routeToGeoJSON = (route: [number, number][]): GeoJSON.Feature<GeoJSON.LineString> => ({
	type: 'Feature',
	properties: {},
	geometry: {
		type: 'LineString',
		coordinates: route.map(toLngLat)
	}
})

function addRouteLayer(map: maplibregl.Map, route: [number, number][]) {
	if (map.getSource(ROUTE_SOURCE_ID)) return

	map.addSource(ROUTE_SOURCE_ID, {
		type: 'geojson',
		data: routeToGeoJSON(route)
	})
	map.addLayer({
		id: ROUTE_LAYER_ID,
		type: 'line',
		source: ROUTE_SOURCE_ID,
		layout: {
			'line-join': 'round',
			'line-cap': 'round'
		},
		paint: {
			'line-color': '#0000ff',
			'line-width': 5,
			'line-opacity': 0.7
		}
	})
}

function useMarker(
	mapRef: React.RefObject<maplibregl.Map | null>,
	mapReady: boolean,
	coord: [number, number] | null | undefined,
	color: string
) {
	const markerRef = useRef<maplibregl.Marker | null>(null)

	useEffect(() => {
		const map = mapRef.current
		if (!map || !mapReady) return

		if (!coord) {
			markerRef.current?.remove()
			markerRef.current = null
			return
		}

		if (!markerRef.current) {
			markerRef.current = new maplibregl.Marker({ color })
		}
		markerRef.current.setLngLat(toLngLat(coord)).addTo(map)
	}, [mapRef, mapReady, coord, color])

	useEffect(() => {
		return () => {
			markerRef.current?.remove()
			markerRef.current = null
		}
	}, [])
}

interface MapComponentProps {
	center?: [number, number]
	zoom?: number
	className?: string
	markerMode: 'start' | 'end' | null
	route: [number, number][]
	onMarkerSet: (type: 'start' | 'end', position: [number, number]) => void
	adjustedStartCoord?: [number, number] | null
	adjustedEndCoord?: [number, number] | null
	clientStartCoord?: [number, number] | null
	clientEndCoord?: [number, number] | null
}

export function MapComponent({
	center = [45.755536, 126.636858],
	zoom = 13,
	className = "h-96 w-full rounded-lg",
	markerMode,
	route,
	onMarkerSet,
	adjustedStartCoord,
	adjustedEndCoord,
	clientStartCoord,
	clientEndCoord
}: MapComponentProps) {
	const { theme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [mapReady, setMapReady] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const mapRef = useRef<maplibregl.Map | null>(null)
	const markerModeRef = useRef(markerMode)
	const onMarkerSetRef = useRef(onMarkerSet)
	const routeRef = useRef(route)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		markerModeRef.current = markerMode
		onMarkerSetRef.current = onMarkerSet
	}, [markerMode, onMarkerSet])

	const currentTheme = mounted ? (resolvedTheme || theme) : 'light'
	const isDark = currentTheme === 'dark'
	const styleUrl = isDark ? DARK_STYLE : LIGHT_STYLE

	useEffect(() => {
		if (!containerRef.current) return

		const map = new maplibregl.Map({
			container: containerRef.current,
			style: styleUrl,
			center: toLngLat(center),
			zoom,
			attributionControl: { compact: true }
		})
		map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

		map.on('style.load', () => {
			addRouteLayer(map, routeRef.current)
			setMapReady(true)
		})

		map.on('click', (e) => {
			if (!markerModeRef.current) return

			const newPoint: [number, number] = [e.lngLat.lat, e.lngLat.lng]
			onMarkerSetRef.current(markerModeRef.current, newPoint)
		})

		mapRef.current = map

		return () => {
			map.remove()
			mapRef.current = null
			setMapReady(false)
		}
	}, [])

	useEffect(() => {
		const map = mapRef.current
		if (!map || !mapReady) return
		map.setStyle(styleUrl)
	}, [styleUrl])

	useEffect(() => {
		routeRef.current = route
		const map = mapRef.current
		if (!map || !mapReady) return

		const source = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
		source?.setData(routeToGeoJSON(route))
	}, [route, mapReady])

	useMarker(mapRef, mapReady, adjustedStartCoord || clientStartCoord, '#16a34a')
	useMarker(mapRef, mapReady, adjustedEndCoord || clientEndCoord, '#dc2626')

	const getCursorClass = () => {
		if (markerMode === 'start') return styles.startMarkerCursor
		if (markerMode === 'end') return styles.endMarkerCursor
		return ''
	}

	return (
		<div className={`${className} ${isDark ? styles.darkMap : ''} ${getCursorClass()}`}>
			<div ref={containerRef} className="h-full w-full rounded-lg overflow-hidden" />
		</div>
	)
}
