export type RouteStatus = 'PENDING_PARENT' | 'PENDING_DRIVER' | 'ROUTE_LOCKED';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface StudentRouteDetails {
  studentId: string;
  studentName: string;
  parentPhone: string;
  homeLocation?: LatLng;
  assignedStopLocation?: LatLng;
  stopName?: string;
  routeStatus: RouteStatus;
}

export interface ParentSubmitPayload {
  student_id: string;
  home_lat: number;
  home_lng: number;
}

export interface DriverAssignPayload {
  student_id: string;
  stop_lat: number;
  stop_lng: number;
  stop_name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
