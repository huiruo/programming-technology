'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

console.log('=Babel:', Babel);
function Test() {
  console.log('test-render');

  var _React$useState = React.useState('改变我'),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    data = _React$useState2[0],
    setData = _React$useState2[1];

  var _React$useState3 = React.useState(false),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    showDiv = _React$useState4[0],
    setShowDiv = _React$useState4[1];

  var onClickText = function onClickText() {
    console.log('=useState=onClick');
    setData('努力哦');
    setShowDiv(!showDiv);
  };

  var onClickText2 = function onClickText2() {
    console.log('=useState=onClick:', data);
  };

  React.useEffect(function () {
    console.log('=副作用-useEffect-->运行');
  }, []);

  React.useLayoutEffect(function () {
    console.log('=副作用-useLayoutEffect-->运行');
  }, []);

  return React.createElement(
    'div',
    { id: 'div1', className: 'c1' },
    React.createElement(
      'button',
      { onClick: onClickText, className: 'btn' },
      'Hello world,Click me'
    ),
    React.createElement(
      'span',
      null,
      data
    ),
    showDiv && React.createElement(
      'div',
      null,
      '\u88AB\u4F60\u53D1\u73B0\u4E86'
    ),
    React.createElement(
      'div',
      { id: 'div2', className: 'c2' },
      React.createElement(
        'p',
        null,
        '\u6D4B\u8BD5\u5B50\u8282\u70B9'
      )
    )
  );
}

var root = ReactDOM.createRoot(document.getElementById('root'));
console.log("=app=root:", root);
root.render(React.createElement(Test, null));
// 17 写法
// ReactDOM.render(<Test />, document.getElementById('root'))
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIklubGluZSBCYWJlbCBzY3JpcHQiXSwibmFtZXMiOlsiY29uc29sZSIsImxvZyIsIkJhYmVsIiwiVGVzdCIsIlJlYWN0IiwidXNlU3RhdGUiLCJkYXRhIiwic2V0RGF0YSIsInNob3dEaXYiLCJzZXRTaG93RGl2Iiwib25DbGlja1RleHQiLCJvbkNsaWNrVGV4dDIiLCJ1c2VFZmZlY3QiLCJ1c2VMYXlvdXRFZmZlY3QiLCJyb290IiwiUmVhY3RET00iLCJjcmVhdGVSb290IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7OztBQUNJQSxRQUFRQyxHQUFSLENBQVksU0FBWixFQUF1QkMsS0FBdkI7QUFDQSxTQUFTQyxJQUFULEdBQWdCO0FBQ2RILFVBQVFDLEdBQVIsQ0FBWSxhQUFaOztBQURjLHdCQUVVRyxNQUFNQyxRQUFOLENBQWUsS0FBZixDQUZWO0FBQUE7QUFBQSxNQUVQQyxJQUZPO0FBQUEsTUFFREMsT0FGQzs7QUFBQSx5QkFHZ0JILE1BQU1DLFFBQU4sQ0FBZSxLQUFmLENBSGhCO0FBQUE7QUFBQSxNQUdQRyxPQUhPO0FBQUEsTUFHRUMsVUFIRjs7QUFLZCxNQUFNQyxjQUFjLFNBQWRBLFdBQWMsR0FBTTtBQUN4QlYsWUFBUUMsR0FBUixDQUFZLG1CQUFaO0FBQ0FNLFlBQVEsS0FBUjtBQUNBRSxlQUFXLENBQUNELE9BQVo7QUFDRCxHQUpEOztBQU1BLE1BQU1HLGVBQWUsU0FBZkEsWUFBZSxHQUFNO0FBQ3pCWCxZQUFRQyxHQUFSLENBQVksb0JBQVosRUFBa0NLLElBQWxDO0FBQ0QsR0FGRDs7QUFJQUYsUUFBTVEsU0FBTixDQUFnQixZQUFNO0FBQ3BCWixZQUFRQyxHQUFSLENBQVkscUJBQVo7QUFDRCxHQUZELEVBRUcsRUFGSDs7QUFJQUcsUUFBTVMsZUFBTixDQUFzQixZQUFNO0FBQzFCYixZQUFRQyxHQUFSLENBQVksMkJBQVo7QUFDRCxHQUZELEVBRUcsRUFGSDs7QUFJQSxTQUNFO0FBQUE7QUFBQSxNQUFLLElBQUcsTUFBUixFQUFlLFdBQVUsSUFBekI7QUFDRTtBQUFBO0FBQUEsUUFBUSxTQUFTUyxXQUFqQixFQUE4QixXQUFVLEtBQXhDO0FBQUE7QUFBQSxLQURGO0FBRUU7QUFBQTtBQUFBO0FBQU9KO0FBQVAsS0FGRjtBQUdHRSxlQUFXO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FIZDtBQUlFO0FBQUE7QUFBQSxRQUFLLElBQUcsTUFBUixFQUFlLFdBQVUsSUFBekI7QUFDRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREY7QUFKRixHQURGO0FBVUQ7O0FBRUQsSUFBTU0sT0FBT0MsU0FBU0MsVUFBVCxDQUFvQkMsU0FBU0MsY0FBVCxDQUF3QixNQUF4QixDQUFwQixDQUFiO0FBQ0FsQixRQUFRQyxHQUFSLENBQVksWUFBWixFQUEwQmEsSUFBMUI7QUFDQUEsS0FBS0ssTUFBTCxDQUFZLG9CQUFDLElBQUQsT0FBWjtBQUNBO0FBQ0EiLCJmaWxlIjoiSW5saW5lIEJhYmVsIHNjcmlwdCIsInNvdXJjZXNDb250ZW50IjpbIlxuICAgIGNvbnNvbGUubG9nKCc9QmFiZWw6JywgQmFiZWwpXG4gICAgZnVuY3Rpb24gVGVzdCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0ZXN0LXJlbmRlcicpXG4gICAgICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSBSZWFjdC51c2VTdGF0ZSgn5pS55Y+Y5oiRJylcbiAgICAgIGNvbnN0IFtzaG93RGl2LCBzZXRTaG93RGl2XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gICAgICBjb25zdCBvbkNsaWNrVGV4dCA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJz11c2VTdGF0ZT1vbkNsaWNrJyk7XG4gICAgICAgIHNldERhdGEoJ+WKquWKm+WTpicpXG4gICAgICAgIHNldFNob3dEaXYoIXNob3dEaXYpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9uQ2xpY2tUZXh0MiA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJz11c2VTdGF0ZT1vbkNsaWNrOicsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnPeWJr+S9nOeUqC11c2VFZmZlY3QtLT7ov5DooYwnKTtcbiAgICAgIH0sIFtdKVxuXG4gICAgICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnPeWJr+S9nOeUqC11c2VMYXlvdXRFZmZlY3QtLT7ov5DooYwnKTtcbiAgICAgIH0sIFtdKVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGlkPSdkaXYxJyBjbGFzc05hbWU9J2MxJz5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e29uQ2xpY2tUZXh0fSBjbGFzc05hbWU9XCJidG5cIj5IZWxsbyB3b3JsZCxDbGljayBtZTwvYnV0dG9uPlxuICAgICAgICAgIDxzcGFuPntkYXRhfTwvc3Bhbj5cbiAgICAgICAgICB7c2hvd0RpdiAmJiA8ZGl2Puiiq+S9oOWPkeeOsOS6hjwvZGl2Pn1cbiAgICAgICAgICA8ZGl2IGlkPSdkaXYyJyBjbGFzc05hbWU9J2MyJz5cbiAgICAgICAgICAgIDxwPua1i+ivleWtkOiKgueCuTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdCA9IFJlYWN0RE9NLmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSlcbiAgICBjb25zb2xlLmxvZyhcIj1hcHA9cm9vdDpcIiwgcm9vdClcbiAgICByb290LnJlbmRlcig8VGVzdCAvPik7XG4gICAgLy8gMTcg5YaZ5rOVXG4gICAgLy8gUmVhY3RET00ucmVuZGVyKDxUZXN0IC8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKVxuICAiXX0=