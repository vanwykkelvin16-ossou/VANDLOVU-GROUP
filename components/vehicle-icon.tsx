import {useId} from 'react';

/** Original supplied artwork, framed to remove its transparent outer padding. */
export function VehicleIcon({category,size=32,white=false}:{category:string;size?:number;white?:boolean}) {
  const maskId=useId();
  const car=category==='LDV';
  const artwork=<image href={car?'/icons/car.png':'/icons/truck.png'} width="1080" height="1350"/>;
  return <svg aria-hidden="true" focusable="false" width={size} height={size}
    viewBox={car?'124 347 831 586':'118 329 898 634'}
    style={{display:'block',flexShrink:0}} preserveAspectRatio="xMidYMid meet">
    {white?<><defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1350" style={{maskType:'alpha'}}>{artwork}</mask></defs><rect width="1080" height="1350" fill="#ffffff" mask={`url(#${maskId})`}/></>:artwork}
  </svg>;
}
