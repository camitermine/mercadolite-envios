
import { createBrowserRouter } from 'react-router'
import { MainLayout } from '../layouts/MainLayout/MainLayout'
import { HomePage } from '../pages/HomePage/HomePage'
import { PendingPage } from '../pages/PendingPage/PendingPage'
import { ShipmentsPage } from '../pages/ShipmentsPage/ShipmentsPage'
import { ShipmentFormPage } from '../pages/ShipmentsPage/ShipmentFormPage'
import { NewShipmentPage } from '../pages/NewShipmentPage/NewShipmentPage'
import { CarriersPage } from '../pages/CarriersPage/CarriersPage'
import { CarrierFormPage } from '../pages/CarriersPage/CarrierFormPage'
import { PATHS } from './paths'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: PATHS.dashboard, element: <HomePage /> },
      { path: PATHS.pending, element: <PendingPage /> },

      { path: PATHS.shipments, element: <ShipmentsPage /> },
      { path: PATHS.newShipment, element: <NewShipmentPage /> },
      { path: PATHS.viewShipmentPattern, element: <ShipmentFormPage mode="view" /> },
      { path: PATHS.editShipmentPattern, element: <ShipmentFormPage mode="edit" /> },

      { path: PATHS.carriers, element: <CarriersPage /> },
      { path: PATHS.newCarrier, element: <CarrierFormPage /> },
      { path: PATHS.editCarrierPattern, element: <CarrierFormPage /> },
    ],
  },
])
