
export const PATHS = {
  dashboard: '/',
  pending: '/pending',
  shipments: '/shipments',
  newShipment: '/shipments/new',

  viewShipmentPattern: '/shipments/:trackingNumber/view',
  viewShipment: (trackingNumber: string) =>
    `/shipments/${trackingNumber}/view`,

  editShipmentPattern: '/shipments/:trackingNumber/edit',
  editShipment: (trackingNumber: string) =>
    `/shipments/${trackingNumber}/edit`,

  carriers: '/carriers',
  newCarrier: '/carriers/new',
  editCarrierPattern: '/carriers/:id/edit',
  editCarrier: (id: number) => `/carriers/${id}/edit`,
} as const
