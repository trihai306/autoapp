'use client'
import React from 'react'
import { useDeviceListStore } from '../_store/deviceListStore'

const DeviceListProvider = ({ deviceList, children }) => {
    const setDeviceList = useDeviceListStore((state) => state.setDeviceList)
    

    
    // Set initial device list when component mounts
    React.useEffect(() => {

        if (deviceList) {
            setDeviceList(deviceList)
        }
    }, [deviceList, setDeviceList])

    return children
}

export default DeviceListProvider
