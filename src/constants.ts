export const INPUT_CONTROL_TYPES: string[] = [
  'InputL', 'PushButton', 'ToggleSwitch', 'HighConstant', 'LowConstant', 
  'PassSwitch', 'Clock', 'Clock_ms', 'Clock_Hz_Adj', 'Clock_ms_Adj', 'GatedClock',
  'InputControl', 'InputControl_4', 'InputControl_7', 'InputControl_8'
];

export const OUTPUT_CONTROL_TYPES: string[] = [
  'OutPutL', 'Oscilloscope', 'Display7Segment', 'Display7SegmentSigned', 'Display8Segment', 'Display9Segment', 
  'Display14Segment', 'Display16Segment', 'DotMatrixDisplay', 'DisplayBCD', 'Display2Digit',
  'Display4Digit', 'Buzzer', 'Motor', 'RGB_LED', 'OLED_Display', 'Screen', 'XYScreen'
];

export const SVG_TEMPLATES: Record<string, string> = {
  Screen: `<svg id="Screen" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill="#111827" />
          <path d="M20 10l0 80m15 -80l0 80m15 -80l0 80m15 -80l0 80m15 -80l0 80" stroke="#374151" stroke-width="0.5" opacity="0.3"/>
          <path d="M20 20l80 0m-80 15l80 0m-80 15l80 0m-80 15l80 0m-80 15l80 0" stroke="#374151" stroke-width="0.5" opacity="0.3"/>
      </svg>`,
  XYScreen: `<svg id="XYScreen" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill="#111827" />
          <path d="M20 10l0 80m15 -80l0 80m15 -80l0 80m15 -80l0 80m15 -80l0 80" stroke="#374151" stroke-width="0.5" opacity="0.3"/>
          <path d="M20 20l80 0m-80 15l80 0m-80 15l80 0m-80 15l80 0m-80 15l80 0" stroke="#374151" stroke-width="0.5" opacity="0.3"/>
      </svg>`,
  AND: `<svg id="AND" xmlns="http://www.w3.org/2000/svg" width="100" height="50" >
          <path fill="none" stroke="#000" stroke-width="2" d="M70 25h25M31 15H5M32 35H5"/>
          <path d="M30 5V45H50.47619c11.267908 0 20-9.000045 20-20s-8.732091-20-20-20H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 17.142857 0 9.502902-7.382195 17.142857-17.142857 17.142857H32.857143V7.857143z" />
      </svg>`,
  OR: `<svg id="OR" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 25h25M31 15H5M32 35H5"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 25l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 17C64.451964 33.429075 58.697469 37.68391 53.5 39.8125 48.139339 42.007924 43.658075 42.000001 41.25 42H30c1.873588-3.108434 4.75-9.04935 4.75-17 0-7.973354-2.908531-13.900185-4.78125-17z"/>
      </svg>`,
  NOT: `<svg id="NOT" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M79.15691 25H95M29.043478 25h-24"/>
          <path d="M28.96875 2.59375v44.8125l2.15625-1.0625 41.03125-20v-2.6875l-41.03125-20-2.15625-1.0625zm3 4.8125L68.09375 25l-36.125 17.59375V7.40625z" style="marker:none"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z"  style="marker:none"/>
      </svg>`,
  NAND: `<svg id="NAND" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M79 25h16M31 15H5M32 35H5"/>
          <path d="M30 5V45H50.47619c11.267908 0 20-9.000045 20-20s-8.732091-20-20-20H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 17.142857 0 9.502902-7.382195 17.142857-17.142857 17.142857H32.857143V7.857143z"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" />
        </svg>`,
  NOR: `<svg id="NOR" xmlns="http://www.w3.org/2000/svg" width="100" height="50" >
          <path fill="none" stroke="#000" stroke-width="2" d="M79 25h16M31 15H5M32 35H5"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 25l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 17C64.451964 33.429075 58.697469 37.68391 53.5 39.8125 48.139339 42.007924 43.658075 42.000001 41.25 42H30c1.873588-3.108434 4.75-9.04935 4.75-17 0-7.973354-2.908531-13.900185-4.78125-17z"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" style="marker:none"/>
        </svg>`,
  XOR: `<svg id="XOR" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 25h25M30.38572 15H5M31.3621 35H5"/>
          <g fill-rule="evenodd">
            <path d="M24.25 42C22.65263 44.6444 22 45 22 45h-3.65625l2-2.4375S26 35.56245 26 25 20.34375 7.4375 20.34375 7.4375l-2-2.4375H22c.78125.9375 1.42188 1.65625 2.21875 3C26.09147 11.09981 29 17.02665 29 25c0 7.95065-2.8967 13.87942-4.75 17z"/>
            <path d="M24.09375 5l2 2.4375S31.75 14.43755 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.40808 0 7.6897.02451 13.625-2.40625s12.53654-7.34327 17.6875-16.875L71.25 25l1.3125-.71875C62.25939 5.21559 46.00657 5 41.25 5H24.09375zm5.875 3H41.25c4.68417 0 18.28685-.1302 27.96875 17C64.45196 33.42907 58.69747 37.68391 53.5 39.8125 48.13934 42.00792 43.65808 42 41.25 42H30c1.87359-3.10843 4.75-9.04935 4.75-17 0-7.97335-2.90853-13.90019-4.78125-17z"/>
          </g>
      </svg>`,
  Buffer: `<svg id="Buffer" width="100" height="50" xmlns="http://www.w3.org/2000/svg">
          <g>
           <path id="svg_1" d="m79.15691,25l15.84309,0m-65.95652,0l-24,0" stroke-width="2" stroke="#000" fill="none"/>
           <path id="svg_2" d="m28.96875,2.59375l0,44.8125l2.15625,-1.0625l41.03125,-20l0,-2.6875l-41.03125,-20l-2.15625,-1.0625zm3,4.8125l36.125,17.59375l-36.125,17.59375l0,-35.1875z"/>
           <line id="svg_4" y2="25.39999" x2="69.99999" y1="25.39999" x1="79.99999" stroke-width="2" stroke="#000" fill="none"/>
          </g>
      </svg>`,
  ThreeState: `<svg id="ThreeState" width="100" height="50" xmlns="http://www.w3.org/2000/svg">
          <g>
           <path id="svg_1" d="m79.15691,25l15.84309,0m-65.95652,0l-24,0" stroke-width="2" stroke="#000" fill="none"/>
           <path id="svg_2" d="m28.96875,2.59375l0,44.8125l2.15625,-1.0625l41.03125,-20l0,-2.6875l-41.03125,-20l-2.15625,-1.0625zm3,4.8125l36.125,17.59375l-36.125,17.59375l0,-35.1875z"/>
           <line id="svg_4" y2="25.39999" x2="69.99999" y1="25.39999" x1="79.99999" stroke-width="2" stroke="#000" fill="none"/>
           <line x1="50" y1="15" x2="50" y2="0" stroke="#000" stroke-width="2" />
          </g>
      </svg>`,
  InputL: `<svg fill="#000000" height="48px" width="72px" version="1.1" id="InputL" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60" xml:space="preserve">
              <g> <path d="M42,12H18C8.075,12,0,20.075,0,30s8.075,18,18,18h24c9.925,0,18-8.075,18-18S51.925,12,42,12z M42,46H18 C9.178,46,2,38.822,2,30s7.178-16,16-16h24c8.822,0,16,7.178,16,16S50.822,46,42,46z"></path> 
                  <path d="M42,17c-7.168,0-13,5.832-13,13s5.832,13,13,13s13-5.832,13-13S49.168,17,42,17z M42,41c-6.065,0-11-4.935-11-11 s4.935-11,11-11s11,4.935,11,11S48.065,41,42,41z"></path> 
                  <path d="M17,21c-0.553,0-1,0.447-1,1v16c0,0.553,0.447,1,1,1s1-0.447,1-1V22C18,21.447,17.553,21,17,21z"></path> 
              </g> 
      </svg>`,
  Clock: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16" id="Clock">
          <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z" id="mainIconPathAttribute"></path>
          <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z" id="mainIconPathAttribute"></path>
      </svg>`,
  Clock_ms: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16" id="Clock_ms">
          <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z" id="mainIconPathAttribute"></path>
          <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z" id="mainIconPathAttribute"></path>
      </svg>`,
  Clock_Hz_Adj: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16" id="Clock_Hz_Adj">
          <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z" id="mainIconPathAttribute"></path>
          <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z" id="mainIconPathAttribute"></path>
      </svg>`,
  Clock_ms_Adj: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16" id="Clock_ms_Adj">
          <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z" id="mainIconPathAttribute"></path>
          <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z" id="mainIconPathAttribute"></path>
      </svg>`,
  GatedClock: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16" id="GatedClock">
          <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z" fill="currentColor"></path>
          <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z" fill="currentColor"></path>
          <line x1="0" y1="8" x2="4" y2="8" stroke="currentColor" stroke-width="1" />
      </svg>`,
  OutPutL: `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="25" fill="currentColor" class="bi bi-lightbulb" viewBox="0 0 16 16" id="OutPutL">
          <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1z" id="mainIconPathAttribute"></path>
      </svg>`,
  AND3: `<svg id="AND3" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 25h25M31 15H5M32 35H5"/>
          <path d="M30 5V45H50.47619c11.267908 0 20-9.000045 20-20s-8.732091-20-20-20H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 17.142857 0 9.502902-7.382195 17.142857-17.142857 17.142857H32.857143V7.857143z" />
          <line x1="5" y1="25" x2="30" y2="25" stroke="#000" stroke-width="2" />
      </svg>`,
  OR3: `<svg id="OR3" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 25h25M31 15H5M32 35H5"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 25l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 17C64.451964 33.429075 58.697469 37.68391 53.5 39.8125 48.139339 42.007924 43.658075 42.000001 41.25 42H30c1.873588-3.108434 4.75-9.04935 4.75-17 0-7.973354-2.908531-13.900185-4.78125-17z"/>
          <line x1="5" y1="25" x2="30" y2="25" stroke="#000" stroke-width="2" />
      </svg>`,
  AND4: `<svg id="AND4" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 30h25M31 10H5M32 23H5M32 37H5M31 50H5"/>
          <path d="M30 5V55H50.47619c11.267908 0 20-9.000045 20-25s-8.732091-25-20-25H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 22.142857 0 14.502902-7.382195 22.142857-17.142857 22.142857H32.857143V7.857143z" />
      </svg>`,
  OR4: `<svg id="OR4" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 30h25M31 10H5M32 23H5M32 37H5M31 50H5"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 30s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 30l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 22C64.451964 38.429075 58.697469 42.68391 53.5 44.8125 48.139339 47.007924 43.658075 47.000001 41.25 47H30c1.873588-3.108434 4.75-9.04935 4.75-22 0-12.973354-2.908531-18.900185-4.78125-22z"/>
      </svg>`,
  NAND4: `<svg id="NAND4" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M79 30h16M31 10H5M32 23H5M32 37H5M31 50H5"/>
          <path d="M30 5V55H50.47619c11.267908 0 20-9.000045 20-25s-8.732091-25-20-25H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 22.142857 0 14.502902-7.382195 22.142857-17.142857 22.142857H32.857143V7.857143z"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 30a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" />
      </svg>`,
  NOR4: `<svg id="NOR4" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M79 30h16M31 10H5M32 23H5M32 37H5M31 50H5"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 30s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 30l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 22C64.451964 38.429075 58.697469 42.68391 53.5 44.8125 48.139339 47.007924 43.658075 47.000001 41.25 47H30c1.873588-3.108434 4.75-9.04935 4.75-22 0-12.973354-2.908531-18.900185-4.78125-22z"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 30a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" />
      </svg>`,
  XOR3: `<svg id="XOR3" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 25h25M30.38572 15H5M31.3621 35H5M5 25h25"/>
          <g fill-rule="evenodd">
            <path d="M24.25 42C22.65263 44.6444 22 45 22 45h-3.65625l2-2.4375S26 35.56245 26 25 20.34375 7.4375 20.34375 7.4375l-2-2.4375H22c.78125.9375 1.42188 1.65625 2.21875 3C26.09147 11.09981 29 17.02665 29 25c0 7.95065-2.8967 13.87942-4.75 17z"/>
            <path d="M24.09375 5l2 2.4375S31.75 14.43755 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.40808 0 7.6897.02451 13.625-2.40625s12.53654-7.34327 17.6875-16.875L71.25 25l1.3125-.71875C62.25939 5.21559 46.00657 5 41.25 5H24.09375zm5.875 3H41.25c4.68417 0 18.28685-.1302 27.96875 17C64.45196 33.42907 58.69747 37.68391 53.5 39.8125 48.13934 42.00792 43.65808 42 41.25 42H30c1.87359-3.10843 4.75-9.04935 4.75-17 0-7.97335-2.90853-13.90019-4.78125-17z"/>
          </g>
      </svg>`,
  XNOR: `<svg id="XNOR" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M79 25h16M30.38572 15H5M31.3621 35H5"/>
          <g fill-rule="evenodd">
            <path d="M24.25 42C22.65263 44.6444 22 45 22 45h-3.65625l2-2.4375S26 35.56245 26 25 20.34375 7.4375 20.34375 7.4375l-2-2.4375H22c.78125.9375 1.42188 1.65625 2.21875 3C26.09147 11.09981 29 17.02665 29 25c0 7.95065-2.8967 13.87942-4.75 17z"/>
            <path d="M24.09375 5l2 2.4375S31.75 14.43755 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.40808 0 7.6897.02451 13.625-2.40625s12.53654-7.34327 17.6875-16.875L71.25 25l1.3125-.71875C62.25939 5.21559 46.00657 5 41.25 5H24.09375zm5.875 3H41.25c4.68417 0 18.28685-.1302 27.96875 17C64.45196 33.42907 58.69747 37.68391 53.5 39.8125 48.13933 42.00792 43.65808 42 41.25 42H30c1.87359-3.10843 4.75-9.04935 4.75-17 0-7.97335-2.90853-13.90019-4.78125-17z"/>
          </g>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" />
      </svg>`,
  NAND3: `<svg id="NAND3" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
          <path fill="none" stroke="#000" stroke-width="2" d="M79 25h16M31 15H5M32 35H5M5 25h25"/>
          <path d="M30 5V45H50.47619c11.267908 0 20-9.000045 20-20s-8.732091-20-20-20H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 17.142857 0 9.502902-7.382195 17.142857-17.142857 17.142857H32.857143V7.857143z"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" />
        </svg>`,
  NOR3: `<svg id="NOR3" xmlns="http://www.w3.org/2000/svg" width="100" height="50" >
          <path fill="none" stroke="#000" stroke-width="2" d="M79 25h16M31 15H5M32 35H5M5 25h25"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 25l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 17C64.451964 33.429075 58.697469 37.68391 53.5 39.8125 48.139339 42.007924 43.658075 42.000001 41.25 42H30c1.873588-3.108434 4.75-9.04935 4.75-17 0-7.973354-2.908531-13.900185-4.78125-17z"/>
          <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" style="marker:none"/>
        </svg>`,
  AND5: `<svg id="AND5" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 30h25M31 10H5M32 20H5M32 30H5M32 40H5M31 50H5"/>
          <path d="M30 5V55H50.47619c11.267908 0 20-9.000045 20-25s-8.732091-25-20-25H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 22.142857 0 14.502902-7.382195 22.142857-17.142857 22.142857H32.857143V7.857143z" />
      </svg>`,
  OR5: `<svg id="OR5" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 30h25M31 10H5M32 20H5M32 30H5M32 40H5M31 50H5"/>
          <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 30s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 30l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 22C64.451964 38.429075 58.697469 42.68391 53.5 44.8125 48.139339 47.007924 43.658075 47.000001 41.25 47H30c1.873588-3.108434 4.75-9.04935 4.75-22 0-12.973354-2.908531-18.900185-4.78125-22z"/>
      </svg>`,
  XOR4: `<svg id="XOR4" xmlns="http://www.w3.org/2000/svg" width="100" height="60">
          <path fill="none" stroke="#000" stroke-width="2" d="M70 30h25M30.38572 10H5M31.3621 23H5M31.3621 37H5M30.38572 50H5"/>
          <g fill-rule="evenodd">
            <path d="M24.25 52C22.65263 54.6444 22 55 22 55h-3.65625l2-2.4375S26 45.56245 26 30 20.34375 7.4375 20.34375 7.4375l-2-2.4375H22c.78125.9375 1.42188 1.65625 2.21875 3C26.09147 11.09981 29 17.02665 29 30c0 12.95065-2.8967 18.87942-4.75 22z"/>
            <path d="M24.09375 5l2 2.4375S31.75 14.43755 31.75 30s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.40808 0 7.6897.02451 13.625-2.40625s12.53654-7.34327 17.6875-16.875L71.25 30l1.3125-.71875C62.25939 5.21559 46.00657 5 41.25 5H24.09375zm5.875 3H41.25c4.68417 0 18.28685-.1302 27.96875 22C64.45196 38.42907 58.69747 42.68391 53.5 44.8125 48.13934 47.00792 43.65808 47 41.25 47H30c1.87359-3.10843 4.75-9.04935 4.75-22 0-12.97335-2.90853-18.90019-4.78125-22z"/>
          </g>
      </svg>`,
  SRAM: `<svg id="SRAM" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="10" y="10" width="80" height="80" fill="#1f2937" stroke="#3b82f6" stroke-width="2"/>
          <text x="50" y="55" font-family="Orbitron" font-size="10" text-anchor="middle" fill="#3b82f6">SRAM</text>
      </svg>`,
  EEPROM: `<svg id="EEPROM" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="10" y="10" width="80" height="80" fill="#1f2937" stroke="#10b981" stroke-width="2"/>
          <text x="50" y="55" font-family="Orbitron" font-size="10" text-anchor="middle" fill="#10b981">EEPROM</text>
      </svg>`,
  Crystal_Oscillator: `<svg id="Crystal_Oscillator" xmlns="http://www.w3.org/2000/svg" width="60" height="40">
          <rect x="10" y="10" width="40" height="20" rx="5" fill="#9ca3af" stroke="#4b5563" stroke-width="2"/>
          <line x1="20" y1="15" x2="20" y2="25" stroke="#4b5563" stroke-width="2"/>
          <line x1="40" y1="15" x2="40" y2="25" stroke="#4b5563" stroke-width="2"/>
          <rect x="25" y="12" width="10" height="16" fill="#d1d5db" stroke="#4b5563" stroke-width="1"/>
      </svg>`,
  Reset_Button: `<svg id="Reset_Button" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
          <rect x="5" y="5" width="30" height="30" fill="#ef4444" stroke="#991b1b" stroke-width="2" rx="5"/>
          <text x="20" y="25" font-family="Arial" font-size="8" text-anchor="middle" fill="white">RST</text>
      </svg>`,
  USB_Interface: `<svg id="USB_Interface" xmlns="http://www.w3.org/2000/svg" width="80" height="40">
          <rect x="5" y="5" width="70" height="30" fill="#374151" stroke="#1f2937" stroke-width="2"/>
          <rect x="15" y="10" width="50" height="20" fill="#111827" stroke="#4b5563" stroke-width="1"/>
          <text x="40" y="25" font-family="Orbitron" font-size="8" text-anchor="middle" fill="#9ca3af">USB</text>
      </svg>`,
  VoltageRegulator_R3: `<svg id="VoltageRegulator_R3" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
          <rect x="10" y="10" width="40" height="40" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          <rect x="15" y="5" width="30" height="5" fill="#4b5563"/>
          <text x="30" y="35" font-family="Orbitron" font-size="8" text-anchor="middle" fill="#9ca3af">REG</text>
      </svg>`,
  ATmega16U2: `<svg id="ATmega16U2" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
          <rect x="5" y="5" width="70" height="70" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <circle cx="15" cy="15" r="3" fill="#334155"/>
          <text x="40" y="45" font-family="Orbitron" font-size="8" font-weight="bold" text-anchor="middle" fill="#fbbf24">16U2</text>
      </svg>`,
  ATmega16: `<svg id="ATmega16" xmlns="http://www.w3.org/2000/svg" width="80" height="180">
          <rect x="5" y="5" width="70" height="170" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <rect x="30" y="5" width="20" height="3" fill="#1e293b"/>
          <circle cx="15" cy="15" r="3" fill="#334155"/>
          <text x="40" y="90" font-family="Orbitron" font-size="8" font-weight="bold" text-anchor="middle" fill="#fbbf24">ATmega16</text>
      </svg>`,
  LGT8F328P: `<svg id="LGT8F328P" xmlns="http://www.w3.org/2000/svg" width="80" height="140">
          <rect x="5" y="5" width="70" height="130" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <circle cx="15" cy="15" r="3" fill="#334155"/>
          <text x="40" y="70" font-family="Orbitron" font-size="8" font-weight="bold" text-anchor="middle" fill="#fbbf24">LGT8F</text>
      </svg>`,
  ATmega328P: `<svg id="ATmega328P" xmlns="http://www.w3.org/2000/svg" width="80" height="140">
          <rect x="5" y="5" width="70" height="130" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <rect x="30" y="5" width="20" height="3" fill="#1e293b"/>
          <circle cx="15" cy="15" r="3" fill="#334155"/>
          <text x="40" y="70" font-family="Orbitron" font-size="8" font-weight="bold" text-anchor="middle" fill="#fbbf24">328P</text>
          <rect x="30" y="115" width="20" height="8" fill="#1e293b" stroke="#334155"/>
          <circle cx="40" cy="119" r="1.5" fill="#10b981"/>
      </svg>`,
  ESP32: `<svg id="ESP32" xmlns="http://www.w3.org/2000/svg" width="100" height="140">
          <rect x="5" y="5" width="90" height="130" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <rect x="15" y="15" width="70" height="40" rx="2" fill="#1e293b" stroke="#334155"/>
          <text x="50" y="40" font-family="Orbitron" font-size="10" font-weight="bold" text-anchor="middle" fill="#fbbf24">ESP32</text>
          <rect x="40" y="115" width="20" height="8" fill="#1e293b" stroke="#334155"/>
          <circle cx="50" cy="119" r="1.5" fill="#10b981"/>
      </svg>`,
  ATtiny85: `<svg id="ATtiny85" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
          <rect x="5" y="5" width="50" height="50" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <rect x="20" y="5" width="20" height="3" fill="#1e293b"/>
          <circle cx="12" cy="12" r="2" fill="#334155"/>
          <text x="30" y="35" font-family="Orbitron" font-size="7" font-weight="bold" text-anchor="middle" fill="#fbbf24">T85</text>
      </svg>`,
  Power_Jack: `<svg id="Power_Jack" xmlns="http://www.w3.org/2000/svg" width="60" height="80">
          <rect x="5" y="5" width="50" height="70" fill="#111827" stroke="#374151" stroke-width="2"/>
          <rect x="15" y="15" width="30" height="50" fill="#000" stroke="#4b5563" stroke-width="1"/>
          <circle cx="30" cy="40" r="10" fill="#1f2937"/>
      </svg>`,
  ICSP_Header: `<svg id="ICSP_Header" xmlns="http://www.w3.org/2000/svg" width="40" height="60">
          <rect x="5" y="5" width="30" height="50" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          <circle cx="12" cy="15" r="3" fill="#9ca3af"/>
          <circle cx="28" cy="15" r="3" fill="#9ca3af"/>
          <circle cx="12" cy="30" r="3" fill="#9ca3af"/>
          <circle cx="28" cy="30" r="3" fill="#9ca3af"/>
          <circle cx="12" cy="45" r="3" fill="#9ca3af"/>
          <circle cx="28" cy="45" r="3" fill="#9ca3af"/>
      </svg>`,
  Pin_Header_Digital: `<svg id="Pin_Header_Digital" xmlns="http://www.w3.org/2000/svg" width="200" height="30">
          <rect x="5" y="5" width="190" height="20" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          ${Array.from({ length: 14 }, (_, i) => `<circle cx="${15 + i * 13}" cy="15" r="3" fill="#9ca3af"/>`).join('')}
      </svg>`,
  Pin_Header_Analog: `<svg id="Pin_Header_Analog" xmlns="http://www.w3.org/2000/svg" width="90" height="30">
          <rect x="5" y="5" width="80" height="20" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          ${Array.from({ length: 6 }, (_, i) => `<circle cx="${15 + i * 13}" cy="15" r="3" fill="#9ca3af"/>`).join('')}
      </svg>`,
  LED_SMD: `<svg id="LED_SMD" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <rect x="2" y="2" width="16" height="16" fill="#374151" stroke="#4b5563" stroke-width="1"/>
          <rect x="5" y="5" width="10" height="10" fill="currentColor" opacity="0.8"/>
      </svg>`,
  IC74HC595: `<svg id="IC74HC595" xmlns="http://www.w3.org/2000/svg" width="120" height="180">
          <rect x="10" y="10" width="100" height="160" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          <circle cx="60" cy="15" r="5" fill="#111827"/>
          <text x="60" y="90" font-family="Orbitron" font-size="10" text-anchor="middle" fill="#9ca3af">74HC595</text>
      </svg>`,
  IC7493: `<svg id="IC7493" xmlns="http://www.w3.org/2000/svg" width="120" height="180">
          <rect x="10" y="10" width="100" height="160" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          <circle cx="60" cy="15" r="5" fill="#111827"/>
          <text x="60" y="90" font-family="Orbitron" font-size="10" text-anchor="middle" fill="#9ca3af">74LS93</text>
      </svg>`,
  IC74107: `<svg id="IC74107" width="160" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="15" width="150" height="50" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          <rect x="0" y="35" width="8" height="10" fill="#111827"/>
          <text x="80" y="45" font-family="Orbitron" font-size="10" text-anchor="middle" fill="#9ca3af">74LS107</text>
      </svg>`,
  ICMAX7219: `<svg id="ICMAX7219" xmlns="http://www.w3.org/2000/svg" width="120" height="360">
          <rect x="10" y="10" width="100" height="340" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
          <circle cx="60" cy="15" r="5" fill="#111827"/>
          <text x="60" y="180" font-family="Orbitron" font-size="10" text-anchor="middle" fill="#9ca3af" transform="rotate(-90 60 180)">MAX7219</text>
      </svg>`,
  Display4Digit: `<svg id="Display4Digit" xmlns="http://www.w3.org/2000/svg" width="240" height="100">
          <rect x="5" y="5" width="230" height="90" fill="#111827" stroke="#374151" stroke-width="2"/>
          <rect x="15" y="15" width="45" height="70" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
          <rect x="70" y="15" width="45" height="70" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
          <rect x="125" y="15" width="45" height="70" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
          <rect x="180" y="15" width="45" height="70" fill="#1f2937" stroke="#4b5563" stroke-width="1"/>
          <text x="120" y="85" font-family="Orbitron" font-size="8" text-anchor="middle" fill="#4b5563">4-DIGIT 7-SEG</text>
      </svg>`,
  SR_Flip_Flop: `<svg id="SR_Flip_Flop" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="20" y="10" width="60" height="80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="25" y="30" font-family="Arial" font-size="12">S</text>
          <text x="25" y="80" font-family="Arial" font-size="12">R</text>
          <text x="65" y="30" font-family="Arial" font-size="12">Q</text>
          <text x="65" y="80" font-family="Arial" font-size="12">Q'</text>
          <line x1="5" y1="25" x2="20" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="5" y1="75" x2="20" y2="75" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="25" x2="95" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="75" x2="95" y2="75" stroke="#000" stroke-width="2"/>
      </svg>`,
  D_Flip_Flop: `<svg id="D_Flip_Flop" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="20" y="10" width="60" height="80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="25" y="30" font-family="Arial" font-size="12">D</text>
          <polyline points="20,70 30,75 20,80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="32" y="80" font-family="Arial" font-size="10">CLK</text>
          <text x="65" y="30" font-family="Arial" font-size="12">Q</text>
          <text x="65" y="80" font-family="Arial" font-size="12">Q'</text>
          <line x1="5" y1="25" x2="20" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="5" y1="75" x2="20" y2="75" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="25" x2="95" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="75" x2="95" y2="75" stroke="#000" stroke-width="2"/>
      </svg>`,
  T_Flip_Flop: `<svg id="T_Flip_Flop" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="20" y="10" width="60" height="80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="25" y="30" font-family="Arial" font-size="12">T</text>
          <polyline points="20,70 30,75 20,80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="32" y="80" font-family="Arial" font-size="10">CLK</text>
          <text x="65" y="30" font-family="Arial" font-size="12">Q</text>
          <text x="65" y="80" font-family="Arial" font-size="12">Q'</text>
          <line x1="5" y1="25" x2="20" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="5" y1="75" x2="20" y2="75" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="25" x2="95" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="75" x2="95" y2="75" stroke="#000" stroke-width="2"/>
      </svg>`,
  JK_Flip_Flop: `<svg id="JK_Flip_Flop" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="20" y="10" width="60" height="80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="25" y="25" font-family="Arial" font-size="12">J</text>
          <polyline points="20,45 30,50 20,55" fill="none" stroke="#000" stroke-width="2"/>
          <text x="25" y="85" font-family="Arial" font-size="12">K</text>
          <text x="65" y="25" font-family="Arial" font-size="12">Q</text>
          <text x="65" y="85" font-family="Arial" font-size="12">Q'</text>
          <line x1="5" y1="20" x2="20" y2="20" stroke="#000" stroke-width="2"/>
          <line x1="5" y1="50" x2="20" y2="50" stroke="#000" stroke-width="2"/>
          <line x1="5" y1="80" x2="20" y2="80" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="20" x2="95" y2="20" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="80" x2="95" y2="80" stroke="#000" stroke-width="2"/>
      </svg>`,
  D_Latch: `<svg id="D_Latch" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect x="20" y="10" width="60" height="80" fill="none" stroke="#000" stroke-width="2"/>
          <text x="25" y="30" font-family="Arial" font-size="12">D</text>
          <text x="25" y="80" font-family="Arial" font-size="12">EN</text>
          <text x="65" y="30" font-family="Arial" font-size="12">Q</text>
          <text x="65" y="80" font-family="Arial" font-size="12">Q'</text>
          <line x1="5" y1="25" x2="20" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="5" y1="75" x2="20" y2="75" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="25" x2="95" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="80" y1="75" x2="95" y2="75" stroke="#000" stroke-width="2"/>
      </svg>`,
  PushButton: `<svg id="PushButton" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="#4b5563" stroke="#1f2937" stroke-width="2"/>
          <circle cx="30" cy="30" r="18" fill="#374151" stroke="#111827" stroke-width="1"/>
          <text x="30" y="35" font-family="Arial" font-size="8" text-anchor="middle" fill="#9ca3af">PUSH</text>
      </svg>`,
  ToggleSwitch: `<svg id="ToggleSwitch" xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40">
          <rect x="5" y="5" width="70" height="30" rx="15" fill="#374151" stroke="#1f2937" stroke-width="2"/>
          <circle cx="20" cy="20" r="12" fill="#9ca3af" />
          <text x="55" y="25" font-family="Arial" font-size="10" text-anchor="middle" fill="#9ca3af">OFF</text>
      </svg>`,
  HighConstant: `<svg id="HighConstant" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#22c55e" stroke-width="2"/>
          <text x="20" y="28" font-family="Arial" font-size="20" text-anchor="middle" fill="#22c55e" font-weight="bold">1</text>
      </svg>`,
  LowConstant: `<svg id="LowConstant" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#ef4444" stroke-width="2"/>
          <text x="20" y="28" font-family="Arial" font-size="20" text-anchor="middle" fill="#ef4444" font-weight="bold">0</text>
      </svg>`,
  PassSwitch: `<svg id="PassSwitch" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="30" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="70" y1="25" x2="95" y2="25" stroke="#000" stroke-width="2"/>
          <circle cx="30" cy="25" r="3" fill="#000"/>
          <circle cx="70" cy="25" r="3" fill="#000"/>
          <line x1="30" y1="25" x2="65" y2="10" stroke="#000" stroke-width="2"/>
      </svg>`,
  Resistor: `<svg id="Resistor" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <path d="M5 25 L25 25 L30 15 L35 35 L40 15 L45 35 L50 15 L55 35 L60 15 L65 35 L70 25 L95 25" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Capacitor: `<svg id="Capacitor" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="45" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="10" x2="45" y2="40" stroke="#eee" stroke-width="3"/>
          <line x1="55" y1="10" x2="55" y2="40" stroke="#eee" stroke-width="3"/>
      </svg>`,
  Inductor: `<svg id="Inductor" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <path d="M5 25 L25 25 C 25 10, 35 10, 35 25 C 35 10, 45 10, 45 25 C 45 10, 55 10, 55 25 C 55 10, 65 10, 65 25 L95 25" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Diode: `<svg id="Diode" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="35" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <path d="M35 10 L65 25 L35 40 Z" fill="#eee"/>
          <line x1="65" y1="10" x2="65" y2="40" stroke="#eee" stroke-width="3"/>
      </svg>`,
  LED: `<svg id="LED" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="35" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <path d="M35 10 L65 25 L35 40 Z" fill="#eee"/>
          <line x1="65" y1="10" x2="65" y2="40" stroke="#eee" stroke-width="3"/>
          <line x1="45" y1="5" x2="55" y2="-5" stroke="#eee" stroke-width="1.5"/>
          <path d="M55 -5 L50 -5 L55 0 Z" fill="#eee"/>
          <line x1="55" y1="10" x2="65" y2="0" stroke="#eee" stroke-width="1.5"/>
          <path d="M65 0 L60 0 L65 5 Z" fill="#eee"/>
      </svg>`,
  Transistor_NPN: `<svg id="Transistor_NPN" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="30" x2="35" y2="70" stroke="#eee" stroke-width="4"/>
          <line x1="10" y1="50" x2="35" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="40" x2="65" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="60" x2="65" y2="85" stroke="#eee" stroke-width="2"/>
          <path d="M65 85 L55 80 L60 75 Z" fill="#eee"/>
      </svg>`,
  Transistor_PNP: `<svg id="Transistor_PNP" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="30" x2="35" y2="70" stroke="#eee" stroke-width="4"/>
          <line x1="10" y1="50" x2="35" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="40" x2="65" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="60" x2="65" y2="85" stroke="#eee" stroke-width="2"/>
          <path d="M35 40 L45 45 L40 50 Z" fill="#eee"/>
      </svg>`,
  Potentiometer: `<svg id="Potentiometer" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <path d="M5 15 L25 15 L30 5 L35 25 L40 5 L45 25 L50 5 L55 25 L60 5 L65 25 L70 15 L95 15" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="15" x2="50" y2="55" stroke="#eee" stroke-width="2"/>
          <path d="M50 15 L45 25 L55 25 Z" fill="#eee"/>
      </svg>`,
  Battery: `<svg id="Battery" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <line x1="30" y1="0" x2="30" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="40" x2="30" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="10" y1="20" x2="50" y2="20" stroke="#eee" stroke-width="4"/>
          <line x1="20" y1="40" x2="40" y2="40" stroke="#eee" stroke-width="2"/>
          <text x="45" y="15" font-size="12" font-weight="bold" fill="#eee">+</text>
      </svg>`,
  AC_Voltage_Source: `<svg id="AC_Voltage_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 30 Q 22.5 15, 30 30 T 45 30" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Coil: `<svg id="Coil" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <rect x="25" y="10" width="50" height="30" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="10" x2="35" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="10" x2="65" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="25" x2="25" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="75" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Fuse: `<svg id="Fuse" xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
          <rect x="20" y="10" width="60" height="20" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="20" x2="95" y2="20" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Regulator: `<svg id="Regulator" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <rect x="10" y="10" width="80" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="10" x2="30" y2="50" stroke="#eee" stroke-width="1"/>
          <line x1="70" y1="10" x2="70" y2="50" stroke="#eee" stroke-width="1"/>
          <path d="M35 20 L45 30 L35 40 M45 20 L45 40" fill="none" stroke="#eee" stroke-width="1.5"/>
          <path d="M65 20 L55 30 L65 40 M55 20 L55 40" fill="none" stroke="#eee" stroke-width="1.5"/>
          <line x1="0" y1="20" x2="10" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="40" x2="10" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="90" y1="30" x2="100" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  VCC: `<svg id="VCC" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="40" x2="20" y2="15" stroke="#eee" stroke-width="2"/>
          <path d="M10 15 L20 0 L30 15 Z" fill="#eee"/>
      </svg>`,
  GND: `<svg id="GND" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="25" x2="35" y2="25" stroke="#eee" stroke-width="3"/>
          <line x1="10" y1="32" x2="30" y2="32" stroke="#eee" stroke-width="2"/>
          <line x1="15" y1="39" x2="25" y2="39" stroke="#eee" stroke-width="1"/>
      </svg>`,
  Relay: `<svg id="Relay" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M20 20 L20 40 C 20 45, 30 45, 30 40 C 30 35, 40 35, 40 40 C 40 45, 50 45, 50 40 L50 20" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="70" y1="20" x2="70" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="70" y1="50" x2="85" y2="40" stroke="#eee" stroke-width="2"/>
          <circle cx="85" cy="40" r="3" fill="#eee"/>
          <circle cx="85" cy="70" r="3" fill="#eee"/>
          <line x1="70" y1="80" x2="70" y2="90" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Transformer: `<svg id="Transformer" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M20 20 L20 30 C 20 35, 30 35, 30 30 C 30 25, 40 25, 40 30 C 40 35, 50 35, 50 30 L50 20" fill="none" stroke="#eee" stroke-width="2" transform="rotate(90 35 50)"/>
          <line x1="45" y1="20" x2="45" y2="80" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="20" x2="55" y2="80" stroke="#eee" stroke-width="2"/>
          <path d="M70 20 L70 30 C 70 35, 80 35, 80 30 C 80 25, 90 25, 90 30 C 90 35, 100 35, 100 30 L100 20" fill="none" stroke="#eee" stroke-width="2" transform="rotate(90 85 50)"/>
      </svg>`,
  Display: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="160" viewBox="-1 -1 12 20" stroke="#FFF" stroke-width=".25">
          <polygon id="a" fill="#F00" points="1, 1  2, 0  8, 0  9, 1  8, 2  2, 2"/>
          <polygon id="b" fill="#F00" points="9, 1 10, 2 10, 8  9, 9  8, 8  8, 2"/>
          <polygon id="c" fill="#F00" points="9, 9 10,10 10,16  9,17  8,16  8,10"/>
          <polygon id="d" fill="#F00" points="9,17  8,18  2,18  1,17  2,16  8,16"/>
          <polygon id="e" fill="#F00" points="1,17  0,16  0,10  1, 9  2,10  2,16"/>
          <polygon id="f" fill="#F00" points="1, 9  0, 8  0, 2  1, 1  2, 2  2, 8"/>
          <polygon id="g" fill="#F00" points="1, 9  2, 8  8, 8  9, 9  8,10  2,10"/>
      </svg>`,
  DC_Current_Source: `<svg id="DC_Current_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="15" x2="30" y2="45" stroke="#eee" stroke-width="2"/>
          <path d="M30 45 L25 35 L35 35 Z" fill="#eee"/>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  AC_Current_Source: `<svg id="AC_Current_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 30 Q 22.5 15, 30 30 T 45 30" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="35" x2="30" y2="50" stroke="#eee" stroke-width="1"/>
          <path d="M30 50 L27 45 L33 45 Z" fill="#eee"/>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Step_Voltage_Source: `<svg id="Step_Voltage_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 40 L30 40 L30 20 L45 20" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Step_Current_Source: `<svg id="Step_Current_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 40 L30 40 L30 20 L45 20" fill="none" stroke="#eee" stroke-width="1"/>
          <line x1="30" y1="45" x2="30" y2="55" stroke="#eee" stroke-width="1"/>
          <path d="M30 55 L27 50 L33 50 Z" fill="#eee"/>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  PWL_Voltage_Source: `<svg id="PWL_Voltage_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="35" font-family="Arial" font-size="8" text-anchor="middle" fill="#eee" font-style="italic">PWL</text>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  PWL_Current_Source: `<svg id="PWL_Current_Source" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="35" font-family="Arial" font-size="8" text-anchor="middle" fill="#eee" font-style="italic">PWL</text>
          <line x1="30" y1="45" x2="30" y2="55" stroke="#eee" stroke-width="1"/>
          <path d="M30 55 L27 50 L33 50 Z" fill="#eee"/>
          <line x1="0" y1="30" x2="5" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Zener_Diode: `<svg id="Zener_Diode" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="35" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <path d="M35 10 L65 25 L35 40 Z" fill="#eee"/>
          <path d="M65 10 L65 40 L70 40 M60 10 L65 10" fill="none" stroke="#eee" stroke-width="3"/>
      </svg>`,
  Schottky_Diode: `<svg id="Schottky_Diode" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="35" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <path d="M35 10 L65 25 L35 40 Z" fill="#eee"/>
          <path d="M60 15 L60 10 L65 10 L65 40 L70 40 L70 35" fill="none" stroke="#eee" stroke-width="3"/>
      </svg>`,
  Photodiode: `<svg id="Photodiode" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="35" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <path d="M35 10 L65 25 L35 40 Z" fill="#eee"/>
          <line x1="65" y1="10" x2="65" y2="40" stroke="#eee" stroke-width="3"/>
          <line x1="55" y1="-5" x2="45" y2="5" stroke="#eee" stroke-width="1.5"/>
          <path d="M45 5 L50 5 L45 0 Z" fill="#eee"/>
          <line x1="65" y1="0" x2="55" y2="10" stroke="#eee" stroke-width="1.5"/>
          <path d="M55 10 L60 10 L55 5 Z" fill="#eee"/>
      </svg>`,
  OpAmp: `<svg id="OpAmp" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M20 10 L80 50 L20 90 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="25" y="30" font-family="Arial" font-size="12" fill="#eee">-</text>
          <text x="25" y="75" font-family="Arial" font-size="12" fill="#eee">+</text>
          <line x1="0" y1="25" x2="20" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="75" x2="20" y2="75" stroke="#eee" stroke-width="2"/>
          <line x1="80" y1="50" x2="100" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="50" y2="0" stroke="#eee" stroke-width="1"/>
          <line x1="50" y1="70" x2="50" y2="100" stroke="#eee" stroke-width="1"/>
      </svg>`,
  Node_Label: `<svg id="Node_Label" xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40">
          <path d="M10 5 L70 5 L75 15 L70 25 L10 25 L5 15 Z" fill="#1f2937" stroke="#3b82f6" stroke-width="2"/>
          <circle cx="40" cy="35" r="3" fill="#3b82f6"/>
          <line x1="40" y1="25" x2="40" y2="35" stroke="#3b82f6" stroke-width="1"/>
      </svg>`,
  MOSFET_N: `<svg id="MOSFET_N" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <line x1="30" y1="30" x2="30" y2="70" stroke="#eee" stroke-width="3"/>
          <line x1="40" y1="30" x2="40" y2="45" stroke="#eee" stroke-width="3"/>
          <line x1="40" y1="47.5" x2="40" y2="52.5" stroke="#eee" stroke-width="3"/>
          <line x1="40" y1="55" x2="40" y2="70" stroke="#eee" stroke-width="3"/>
          <line x1="10" y1="50" x2="30" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="35" x2="70" y2="35" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="65" x2="70" y2="65" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="50" x2="55" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="50" x2="55" y2="65" stroke="#eee" stroke-width="2"/>
          <path d="M40 50 L50 45 L50 55 Z" fill="#eee"/>
      </svg>`,
  MOSFET_P: `<svg id="MOSFET_P" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <line x1="30" y1="30" x2="30" y2="70" stroke="#eee" stroke-width="3"/>
          <line x1="40" y1="30" x2="40" y2="45" stroke="#eee" stroke-width="3"/>
          <line x1="40" y1="47.5" x2="40" y2="52.5" stroke="#eee" stroke-width="3"/>
          <line x1="40" y1="55" x2="40" y2="70" stroke="#eee" stroke-width="3"/>
          <line x1="10" y1="50" x2="30" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="35" x2="70" y2="35" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="65" x2="70" y2="65" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="50" x2="55" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="50" x2="55" y2="65" stroke="#eee" stroke-width="2"/>
          <path d="M50 50 L40 45 L40 55 Z" fill="#eee"/>
      </svg>`,
  JFET_N: `<svg id="JFET_N" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <line x1="40" y1="20" x2="40" y2="80" stroke="#eee" stroke-width="4"/>
          <line x1="10" y1="50" x2="40" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="30" x2="70" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="70" x2="70" y2="70" stroke="#eee" stroke-width="2"/>
          <path d="M30 50 L40 45 L40 55 Z" fill="#eee"/>
      </svg>`,
  JFET_P: `<svg id="JFET_P" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <line x1="40" y1="20" x2="40" y2="80" stroke="#eee" stroke-width="4"/>
          <line x1="10" y1="50" x2="40" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="30" x2="70" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="70" x2="70" y2="70" stroke="#eee" stroke-width="2"/>
          <path d="M40 50 L30 45 L30 55 Z" fill="#eee"/>
      </svg>`,
  VCCS: `<svg id="VCCS" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M50 10 L80 50 L50 90 L20 50 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="50" y2="70" stroke="#eee" stroke-width="2"/>
          <path d="M50 70 L45 60 L55 60 Z" fill="#eee"/>
          <line x1="0" y1="30" x2="20" y2="30" stroke="#eee" stroke-width="1"/>
          <line x1="0" y1="70" x2="20" y2="70" stroke="#eee" stroke-width="1"/>
          <text x="5" y="25" font-size="10" fill="#eee">+</text>
          <text x="5" y="80" font-size="10" fill="#eee">-</text>
      </svg>`,
  VCVS: `<svg id="VCVS" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M50 10 L80 50 L50 90 L20 50 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="50" y="40" font-size="12" text-anchor="middle" fill="#eee">+</text>
          <text x="50" y="75" font-size="12" text-anchor="middle" fill="#eee">-</text>
          <line x1="0" y1="30" x2="20" y2="30" stroke="#eee" stroke-width="1"/>
          <line x1="0" y1="70" x2="20" y2="70" stroke="#eee" stroke-width="1"/>
          <text x="5" y="25" font-size="10" fill="#eee">+</text>
          <text x="5" y="80" font-size="10" fill="#eee">-</text>
      </svg>`,
  CCCS: `<svg id="CCCS" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M50 10 L80 50 L50 90 L20 50 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="50" y2="70" stroke="#eee" stroke-width="2"/>
          <path d="M50 70 L45 60 L55 60 Z" fill="#eee"/>
      </svg>`,
  CCVS: `<svg id="CCVS" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M50 10 L80 50 L50 90 L20 50 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="50" y="40" font-size="12" text-anchor="middle" fill="#eee">+</text>
          <text x="50" y="75" font-size="12" text-anchor="middle" fill="#eee">-</text>
      </svg>`,
  Switch_SPST: `<svg id="Switch_SPST" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <circle cx="20" cy="25" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="25" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="24" y1="25" x2="75" y2="5" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="25" x2="16" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="25" x2="100" y2="25" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Switch_SPDT: `<svg id="Switch_SPDT" xmlns="http://www.w3.org/2000/svg" width="100" height="80" viewBox="0 0 100 80">
          <circle cx="20" cy="40" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="20" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="60" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="24" y1="40" x2="75" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="40" x2="16" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="20" x2="100" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="60" x2="100" y2="60" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Switch_DPST: `<svg id="Switch_DPST" xmlns="http://www.w3.org/2000/svg" width="100" height="80" viewBox="0 0 100 80">
          <circle cx="20" cy="20" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="20" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="20" cy="60" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="60" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="24" y1="20" x2="75" y2="5" stroke="#eee" stroke-width="2"/>
          <line x1="24" y1="60" x2="75" y2="45" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="12" x2="50" y2="52" stroke="#eee" stroke-width="1" stroke-dasharray="4"/>
          <line x1="0" y1="20" x2="16" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="20" x2="100" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="60" x2="16" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="60" x2="100" y2="60" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Switch_DPDT: `<svg id="Switch_DPDT" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="20" cy="30" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="15" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="45" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="20" cy="75" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="60" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="90" r="4" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="24" y1="30" x2="75" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="24" y1="75" x2="75" y2="65" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="22" x2="50" y2="67" stroke="#eee" stroke-width="1" stroke-dasharray="4"/>
          <line x1="0" y1="30" x2="16" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="15" x2="100" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="45" x2="100" y2="45" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="75" x2="16" y2="75" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="60" x2="100" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="84" y1="90" x2="100" y2="90" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Relay_SPDT: `<svg id="Relay_SPDT" xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100">
          <rect x="10" y="10" width="100" height="80" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M25 25 Q 30 15, 35 25 T 45 25 T 55 25 T 65 25" fill="none" stroke="#eee" stroke-width="2" transform="rotate(90 45 45)"/>
          <line x1="45" y1="20" x2="45" y2="70" stroke="#eee" stroke-width="1" stroke-dasharray="4"/>
          <circle cx="80" cy="50" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="100" cy="30" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="100" cy="70" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="83" y1="50" x2="97" y2="35" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="10" x2="45" y2="0" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="90" x2="45" y2="100" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Relay_DPDT: `<svg id="Relay_DPDT" xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
          <rect x="10" y="10" width="120" height="80" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M25 25 Q 30 15, 35 25 T 45 25 T 55 25 T 65 25" fill="none" stroke="#eee" stroke-width="2" transform="rotate(90 45 45)"/>
          <line x1="45" y1="20" x2="45" y2="70" stroke="#eee" stroke-width="1" stroke-dasharray="4"/>
          <circle cx="80" cy="30" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="110" cy="20" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="110" cy="40" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="83" y1="30" x2="107" y2="25" stroke="#eee" stroke-width="2"/>
          <circle cx="80" cy="70" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="110" cy="60" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="110" cy="80" r="3" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="83" y1="70" x2="107" y2="65" stroke="#eee" stroke-width="2"/>
          <line x1="95" y1="27" x2="95" y2="67" stroke="#eee" stroke-width="1" stroke-dasharray="4"/>
          <line x1="45" y1="10" x2="45" y2="0" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="90" x2="45" y2="100" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Voltmeter: `<svg id="Voltmeter" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="38" font-family="Arial" font-size="20" text-anchor="middle" fill="#eee">V</text>
          <line x1="30" y1="0" x2="30" y2="5" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="55" x2="30" y2="60" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Ammeter: `<svg id="Ammeter" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="38" font-family="Arial" font-size="20" text-anchor="middle" fill="#eee">A</text>
          <line x1="30" y1="0" x2="30" y2="5" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="55" x2="30" y2="60" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Probe: `<svg id="Probe" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <rect x="5" y="5" width="30" height="30" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="20" y="28" font-family="Arial" font-size="20" text-anchor="middle" fill="#eee">?</text>
          <circle cx="0" cy="20" r="3" fill="#eee"/>
          <line x1="0" y1="20" x2="5" y2="20" stroke="#eee" stroke-width="2"/>
      </svg>`,
  MUX_2to1: `<svg id="MUX_2to1" xmlns="http://www.w3.org/2000/svg" width="40" height="80" viewBox="0 0 40 80">
          <path d="M10 0 L40 20 L40 60 L10 80 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="15" y="25" font-size="10" fill="#eee">0</text>
          <text x="15" y="65" font-size="10" fill="#eee">1</text>
          <line x1="0" y1="20" x2="10" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="60" x2="10" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="40" x2="50" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="70" x2="25" y2="85" stroke="#eee" stroke-width="2"/>
      </svg>`,
  MUX_4to1: `<svg id="MUX_4to1" xmlns="http://www.w3.org/2000/svg" width="60" height="120" viewBox="0 0 60 120">
          <path d="M15 0 L60 30 L60 90 L15 120 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="20" y="25" font-size="10" fill="#eee">0</text>
          <text x="20" y="50" font-size="10" fill="#eee">1</text>
          <text x="20" y="75" font-size="10" fill="#eee">2</text>
          <text x="20" y="100" font-size="10" fill="#eee">3</text>
          <line x1="0" y1="20" x2="15" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="45" x2="15" y2="45" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="70" x2="15" y2="70" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="95" x2="15" y2="95" stroke="#eee" stroke-width="2"/>
          <line x1="60" y1="60" x2="75" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="110" x2="30" y2="130" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="100" x2="45" y2="130" stroke="#eee" stroke-width="2"/>
          <text x="28" y="125" font-size="8" fill="#eee">S0</text>
          <text x="43" y="125" font-size="8" fill="#eee">S1</text>
      </svg>`,
  Half_Adder: `<svg id="Half_Adder" xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60">
          <rect x="10" y="10" width="60" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="40" y="35" font-size="10" text-anchor="middle" fill="#eee">HA</text>
          <text x="15" y="25" font-size="8" fill="#eee">A</text>
          <text x="15" y="45" font-size="8" fill="#eee">B</text>
          <text x="55" y="25" font-size="8" fill="#eee">S</text>
          <text x="55" y="45" font-size="8" fill="#eee">C</text>
      </svg>`,
  Full_Adder: `<svg id="Full_Adder" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <rect x="10" y="10" width="60" height="60" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="40" y="45" font-size="10" text-anchor="middle" fill="#eee">FA</text>
          <text x="15" y="25" font-size="8" fill="#eee">A</text>
          <text x="15" y="45" font-size="8" fill="#eee">B</text>
          <text x="15" y="65" font-size="8" fill="#eee">Ci</text>
          <text x="55" y="35" font-size="8" fill="#eee">S</text>
          <text x="55" y="55" font-size="8" fill="#eee">Co</text>
      </svg>`,
  Adder_4bit: `<svg id="Adder_4bit" xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60">
          <rect x="10" y="10" width="140" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="80" y="35" font-size="12" text-anchor="middle" fill="#eee">4-BIT ADDER</text>
      </svg>`,
  Adder_8bit: `<svg id="Adder_8bit" xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
          <rect x="10" y="10" width="220" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="120" y="35" font-size="12" text-anchor="middle" fill="#eee">8-BIT ADDER</text>
      </svg>`,
  SR_Latch: `<svg id="SR_Latch" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <rect x="10" y="10" width="60" height="60" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="15" y="30" font-size="12" fill="#eee">S</text>
          <text x="15" y="60" font-size="12" fill="#eee">R</text>
          <text x="55" y="30" font-size="12" fill="#eee">Q</text>
          <text x="55" y="60" font-size="12" fill="#eee">Q'</text>
      </svg>`,
  SR_Latch_Inv: `<svg id="SR_Latch_Inv" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <rect x="10" y="10" width="60" height="60" fill="none" stroke="#eee" stroke-width="2"/>
          <circle cx="10" cy="25" r="3" fill="none" stroke="#eee" stroke-width="1"/>
          <circle cx="10" cy="55" r="3" fill="none" stroke="#eee" stroke-width="1"/>
          <text x="15" y="30" font-size="12" fill="#eee">S</text>
          <text x="15" y="60" font-size="12" fill="#eee">R</text>
          <text x="55" y="30" font-size="12" fill="#eee">Q</text>
          <text x="55" y="60" font-size="12" fill="#eee">Q'</text>
      </svg>`,
  Comparator: `<svg id="Comparator" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <path d="M20 10 L80 50 L20 90 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="25" y="30" font-family="Arial" font-size="12" fill="#eee">+</text>
          <text x="25" y="75" font-family="Arial" font-size="12" fill="#eee">-</text>
          <text x="40" y="55" font-size="10" fill="#eee">CMP</text>
          <line x1="0" y1="25" x2="20" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="75" x2="20" y2="75" stroke="#eee" stroke-width="2"/>
          <line x1="80" y1="50" x2="100" y2="50" stroke="#eee" stroke-width="2"/>
      </svg>`,
  LB1: `<svg id="LB1" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <rect x="20" y="10" width="60" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="50" y="35" font-family="Arial" font-size="14" text-anchor="middle" fill="#eee" font-weight="bold">LB1</text>
          <line x1="0" y1="30" x2="20" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="80" y1="30" x2="100" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  SUM1: `<svg id="SUM1" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="20" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="18" y="25" font-size="12" fill="#eee" text-anchor="middle">+</text>
          <text x="18" y="42" font-size="12" fill="#eee" text-anchor="middle">-</text>
          <line x1="0" y1="30" x2="10" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="50" x2="30" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  SUM2: `<svg id="SUM2" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="20" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="18" y="25" font-size="12" fill="#eee" text-anchor="middle">+</text>
          <text x="18" y="42" font-size="12" fill="#eee" text-anchor="middle">+</text>
          <line x1="0" y1="30" x2="10" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="50" x2="30" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  MUL1: `<svg id="MUL1" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="20" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="38" font-size="20" fill="#eee" text-anchor="middle">×</text>
          <line x1="0" y1="30" x2="10" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="50" x2="30" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="60" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Bridge_Rectifier: `<svg id="Bridge_Rectifier" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <rect x="20" y="20" width="40" height="40" fill="none" stroke="#eee" stroke-width="2" transform="rotate(45 40 40)"/>
          <text x="40" y="25" font-size="10" fill="#eee" text-anchor="middle">+</text>
          <text x="40" y="65" font-size="10" fill="#eee" text-anchor="middle">-</text>
          <text x="25" y="45" font-size="10" fill="#eee" text-anchor="middle">~</text>
          <text x="55" y="45" font-size="10" fill="#eee" text-anchor="middle">~</text>
          <line x1="40" y1="0" x2="40" y2="12" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="68" x2="40" y2="80" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="40" x2="12" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="68" y1="40" x2="80" y2="40" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Darlington_NPN: `<svg id="Darlington_NPN" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="45" cy="40" r="30" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="25" x2="25" y2="55" stroke="#eee" stroke-width="3"/>
          <line x1="0" y1="40" x2="25" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="35" x2="45" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="45" x2="40" y2="55" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="55" x2="40" y2="45" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="55" x2="55" y2="65" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="20" x2="45" y2="0" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="65" x2="55" y2="80" stroke="#eee" stroke-width="2"/>
          <polygon points="55,65 50,58 58,60" fill="#eee"/>
          <line x1="45" y1="20" x2="55" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="20" x2="55" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="40" x2="40" y2="55" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Darlington_PNP: `<svg id="Darlington_PNP" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="45" cy="40" r="30" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="25" x2="25" y2="55" stroke="#eee" stroke-width="3"/>
          <line x1="0" y1="40" x2="25" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="35" x2="45" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="45" x2="40" y2="55" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="20" x2="45" y2="0" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="65" x2="55" y2="80" stroke="#eee" stroke-width="2"/>
          <polygon points="25,45 32,52 30,44" fill="#eee"/>
          <line x1="45" y1="20" x2="55" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="20" x2="55" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="40" x2="40" y2="55" stroke="#eee" stroke-width="2"/>
          <line x1="40" y1="55" x2="55" y2="65" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Variable_Capacitor: `<svg id="Variable_Capacitor" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <line x1="5" y1="30" x2="45" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="95" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="15" x2="45" y2="45" stroke="#eee" stroke-width="3"/>
          <line x1="55" y1="15" x2="55" y2="45" stroke="#eee" stroke-width="3"/>
          <path d="M35 50 L65 10" fill="none" stroke="#eee" stroke-width="2"/>
          <polygon points="65,10 60,15 68,13" fill="#eee"/>
      </svg>`,
  Polarized_Capacitor: `<svg id="Polarized_Capacitor" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <line x1="5" y1="30" x2="45" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="95" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="15" x2="45" y2="45" stroke="#eee" stroke-width="3"/>
          <path d="M55 15 Q 65 30, 55 45" fill="none" stroke="#eee" stroke-width="3"/>
          <text x="38" y="20" font-size="10" fill="#eee">+</text>
      </svg>`,
  Crystal: `<svg id="Crystal" xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="30" x2="30" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="30" x2="80" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="15" x2="30" y2="45" stroke="#eee" stroke-width="2"/>
          <line x1="50" y1="15" x2="50" y2="45" stroke="#eee" stroke-width="2"/>
          <rect x="35" y="15" width="10" height="30" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Speaker: `<svg id="Speaker" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <rect x="10" y="30" width="15" height="20" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M25 30 L50 10 L50 70 L25 50 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M55 30 Q 65 40, 55 50" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M60 20 Q 75 40, 60 60" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="35" x2="10" y2="35" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="45" x2="10" y2="45" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Antenna: `<svg id="Antenna" xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80">
          <line x1="30" y1="80" x2="30" y2="30" stroke="#eee" stroke-width="2"/>
          <path d="M10 10 L30 30 L50 10" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="10" y1="10" x2="50" y2="10" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Lamp: `<svg id="Lamp" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 45 L30 15 L45 45" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M20 30 Q 30 40, 40 30" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="55" x2="30" y2="70" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Microphone: `<svg id="Microphone" xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80">
          <path d="M15 10 A 15 15 0 0 1 45 10 L 45 40 A 15 15 0 0 1 15 40 Z" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M10 35 A 20 20 0 0 0 50 35" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="55" x2="30" y2="70" stroke="#eee" stroke-width="2"/>
          <line x1="20" y1="70" x2="40" y2="70" stroke="#eee" stroke-width="2"/>
      </svg>`,
  LDR: `<svg id="LDR" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M25 40 L30 30 L35 50 L40 30 L45 50 L50 30 L55 40" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="40" x2="25" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="40" x2="80" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="10" y1="10" x2="25" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="20" y1="5" x2="35" y2="20" stroke="#eee" stroke-width="2"/>
          <polygon points="25,25 20,22 23,18" fill="#eee"/>
          <polygon points="35,20 30,17 33,13" fill="#eee"/>
      </svg>`,
  SCR: `<svg id="SCR" xmlns="http://www.w3.org/2000/svg" width="100" height="80" viewBox="0 0 100 80">
          <line x1="10" y1="40" x2="35" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="40" x2="90" y2="40" stroke="#eee" stroke-width="2"/>
          <path d="M35 20 L65 40 L35 60 Z" fill="#eee"/>
          <line x1="65" y1="20" x2="65" y2="60" stroke="#eee" stroke-width="3"/>
          <line x1="55" y1="50" x2="70" y2="70" stroke="#eee" stroke-width="2"/>
      </svg>`,
  DIAC: `<svg id="DIAC" xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="30" x2="25" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="30" x2="80" y2="30" stroke="#eee" stroke-width="2"/>
          <path d="M25 15 L45 30 L25 45 Z" fill="#eee"/>
          <path d="M55 15 L35 30 L55 45 Z" fill="#eee"/>
          <line x1="25" y1="15" x2="25" y2="45" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="15" x2="55" y2="45" stroke="#eee" stroke-width="2"/>
      </svg>`,
  TRIAC: `<svg id="TRIAC" xmlns="http://www.w3.org/2000/svg" width="100" height="80" viewBox="0 0 100 80">
          <line x1="10" y1="40" x2="35" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="40" x2="90" y2="40" stroke="#eee" stroke-width="2"/>
          <path d="M35 25 L55 40 L35 55 Z" fill="#eee"/>
          <path d="M65 25 L45 40 L65 55 Z" fill="#eee"/>
          <line x1="35" y1="25" x2="35" y2="55" stroke="#eee" stroke-width="2"/>
          <line x1="65" y1="25" x2="65" y2="55" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="50" x2="70" y2="70" stroke="#eee" stroke-width="2"/>
      </svg>`,
  PWM_Block: `<svg id="PWM_Block" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <rect x="20" y="10" width="60" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M25 35 Q 30 25, 35 35 T 45 35" fill="none" stroke="#eee" stroke-width="1"/>
          <polyline points="55,35 55,25 65,25 65,35 75,35" fill="none" stroke="#eee" stroke-width="1"/>
          <text x="35" y="50" font-size="8" fill="#eee">IN</text>
          <text x="60" y="50" font-size="8" fill="#eee">OUT</text>
          <line x1="0" y1="30" x2="20" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="80" y1="30" x2="100" y2="30" stroke="#eee" stroke-width="2"/>
      </svg>`,
  IC555: `<svg id="IC555" xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160">
          <rect x="20" y="20" width="80" height="120" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="60" y="85" font-family="Arial" font-size="20" text-anchor="middle" fill="#eee" font-weight="bold">555</text>
          <text x="25" y="35" font-size="8" fill="#eee">RESET</text>
          <text x="80" y="35" font-size="8" fill="#eee">VCC</text>
          <text x="25" y="65" font-size="8" fill="#eee">TRIGGER</text>
          <text x="70" y="65" font-size="8" fill="#eee">DISCHARGE</text>
          <text x="70" y="95" font-size="8" fill="#eee">THRESHOLD</text>
          <text x="25" y="125" font-size="8" fill="#eee">OUTPUT</text>
          <text x="55" y="135" font-size="8" fill="#eee">GND</text>
          <text x="80" y="125" font-size="8" fill="#eee">CONTROL</text>
          <line x1="0" y1="30" x2="20" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="60" x2="20" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="120" x2="20" y2="120" stroke="#eee" stroke-width="2"/>
          <line x1="100" y1="30" x2="120" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="100" y1="60" x2="120" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="100" y1="90" x2="120" y2="90" stroke="#eee" stroke-width="2"/>
          <line x1="100" y1="120" x2="120" y2="120" stroke="#eee" stroke-width="2"/>
          <line x1="60" y1="140" x2="60" y2="160" stroke="#eee" stroke-width="2"/>
      </svg>`,
  IC555_Simple: `<svg id="IC555_Simple" xmlns="http://www.w3.org/2000/svg" width="100" height="80" viewBox="0 0 100 80">
          <rect x="20" y="10" width="60" height="60" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="50" y="45" font-family="Arial" font-size="14" text-anchor="middle" fill="#eee" font-weight="bold">555</text>
          <text x="25" y="25" font-size="6" fill="#eee">TRIG</text>
          <text x="25" y="45" font-size="6" fill="#eee">THR</text>
          <text x="25" y="65" font-size="6" fill="#eee">RST</text>
          <text x="65" y="45" font-size="6" fill="#eee">OUT</text>
          <line x1="0" y1="20" x2="20" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="40" x2="20" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="60" x2="20" y2="60" stroke="#eee" stroke-width="2"/>
          <line x1="80" y1="40" x2="100" y2="40" stroke="#eee" stroke-width="2"/>
      </svg>`,
  GND_Earth: `<svg id="GND_Earth" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="20" x2="35" y2="20" stroke="#eee" stroke-width="2"/>
          <line x1="10" y1="26" x2="30" y2="26" stroke="#eee" stroke-width="2"/>
          <line x1="15" y1="32" x2="25" y2="32" stroke="#eee" stroke-width="2"/>
      </svg>`,
  GND_Protective: `<svg id="GND_Protective" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="20" y1="0" x2="20" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="10" y1="15" x2="30" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="13" y1="21" x2="27" y2="21" stroke="#eee" stroke-width="2"/>
          <line x1="17" y1="27" x2="23" y2="27" stroke="#eee" stroke-width="2"/>
      </svg>`,
  GND_Signal: `<svg id="GND_Signal" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="20" stroke="#eee" stroke-width="2"/>
          <path d="M5 20 L35 20 L20 35 Z" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Voltage_Source_Ideal: `<svg id="Voltage_Source_Ideal" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="25" font-size="12" text-anchor="middle" fill="#eee" font-family="Arial">+</text>
          <text x="30" y="45" font-size="12" text-anchor="middle" fill="#eee" font-family="Arial">-</text>
      </svg>`,
  Current_Source_Ideal: `<svg id="Current_Source_Ideal" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="30" y1="15" x2="30" y2="45" stroke="#eee" stroke-width="2"/>
          <path d="M30 45 L25 35 L35 35 Z" fill="#eee"/>
      </svg>`,
  Pulse_Generator: `<svg id="Pulse_Generator" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 40 L25 40 L25 20 L35 20 L35 40 L45 40" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Sawtooth_Generator: `<svg id="Sawtooth_Generator" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 40 L35 20 L35 40 L55 20" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Step_Generator: `<svg id="Step_Generator" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M15 45 L15 15 L45 15" fill="none" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Cell: `<svg id="Cell" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <line x1="10" y1="30" x2="25" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="30" x2="50" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="10" x2="25" y2="50" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="20" x2="35" y2="40" stroke="#eee" stroke-width="4"/>
      </svg>`,
  Preset_Resistor: `<svg id="Preset_Resistor" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <rect x="25" y="15" width="50" height="20" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="25" x2="25" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="75" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="40" x2="65" y2="10" stroke="#eee" stroke-width="2"/>
          <line x1="60" y1="10" x2="65" y2="10" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Attenuator: `<svg id="Attenuator" xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <rect x="25" y="10" width="50" height="40" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="30" x2="25" y2="30" stroke="#eee" stroke-width="2"/>
          <line x1="75" y1="30" x2="95" y2="30" stroke="#eee" stroke-width="2"/>
          <text x="50" y="35" font-size="10" text-anchor="middle" fill="#eee" font-family="Arial">ATT</text>
      </svg>`,
  Trimmer_Capacitor: `<svg id="Trimmer_Capacitor" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <line x1="5" y1="25" x2="45" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="55" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="45" y1="10" x2="45" y2="40" stroke="#eee" stroke-width="3"/>
          <line x1="55" y1="10" x2="55" y2="40" stroke="#eee" stroke-width="3"/>
          <line x1="35" y1="40" x2="65" y2="10" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="40" x2="40" y2="45" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Heater: `<svg id="Heater" xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">
          <rect x="25" y="15" width="50" height="20" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="25" x2="25" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="75" y1="25" x2="95" y2="25" stroke="#eee" stroke-width="2"/>
          <path d="M30 25 L35 20 L40 30 L45 20 L50 30 L55 20 L60 30 L65 25" fill="none" stroke="#eee" stroke-width="1.5"/>
      </svg>`,
  Fuse_IEC: `<svg id="Fuse_IEC" xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
          <rect x="25" y="10" width="50" height="20" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="5" y1="20" x2="95" y2="20" stroke="#eee" stroke-width="2"/>
      </svg>`,
  Wattmeter: `<svg id="Wattmeter" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="38" font-size="16" text-anchor="middle" fill="#eee" font-family="Arial">W</text>
      </svg>`,
  Varmeter: `<svg id="Varmeter" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="38" font-size="14" text-anchor="middle" fill="#eee" font-family="Arial">VAr</text>
      </svg>`,
  Hz_Meter: `<svg id="Hz_Meter" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <text x="30" y="38" font-size="14" text-anchor="middle" fill="#eee" font-family="Arial">Hz</text>
      </svg>`,
  Thermometer_Symbol: `<svg id="Thermometer_Symbol" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M30 15 L30 40 M27 40 L33 40 M28 35 L32 35 M28 30 L32 30 M28 25 L32 25" stroke="#eee" stroke-width="2"/>
          <circle cx="30" cy="45" r="5" fill="#eee"/>
      </svg>`,
  Hour_Meter: `<svg id="Hour_Meter" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <path d="M22 20 L38 20 L22 40 L38 40 Z" fill="none" stroke="#eee" stroke-width="2" />
          <line x1="22" y1="20" x2="38" y2="40" stroke="#eee" stroke-width="1" />
          <line x1="38" y1="20" x2="22" y2="40" stroke="#eee" stroke-width="1" />
      </svg>`,
  Neon_Lamp: `<svg id="Neon_Lamp" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="25" y1="20" x2="25" y2="40" stroke="#eee" stroke-width="2"/>
          <line x1="35" y1="20" x2="35" y2="40" stroke="#eee" stroke-width="2"/>
          <circle cx="20" cy="30" r="2" fill="#eee"/>
          <circle cx="40" cy="30" r="2" fill="#eee"/>
      </svg>`,
  Fluorescent_Lamp: `<svg id="Fluorescent_Lamp" xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
          <rect x="10" y="10" width="80" height="20" rx="5" fill="none" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="15" x2="10" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="0" y1="25" x2="10" y2="25" stroke="#eee" stroke-width="2"/>
          <line x1="90" y1="15" x2="100" y2="15" stroke="#eee" stroke-width="2"/>
          <line x1="90" y1="25" x2="100" y2="25" stroke="#eee" stroke-width="2"/>
      </svg>`,
};
