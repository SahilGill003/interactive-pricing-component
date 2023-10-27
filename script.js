const App = {
  $: {
    rangeElement: document.querySelector('#range'),
    filledElement: document.querySelector('#filled'),
    sliderElement: document.querySelector('#slider'),
    customInputElement: document.querySelector('#custom-input-range'),
    pageviewLabelElement: document.querySelector('#pageview-num .price-slider'),
    monthPriceLabelElement: document.querySelector('#price-per-month .price-slider'),
    switchBillingElement: document.querySelector('#switch-billing'),
  },


  sliderState: { pos: { clientX: 0, clientY: 0 }, moved: false },
  clientDimensions: { x: 0, y: 0 },
  distanceFromLeft: 0,
  pageviewLabelStates: ['10K', '50K', '100K', '500K', '1M'],
  monthPriceLabelStates: ['8', '12', '16', '24', '36'],
  discountApplied: false,
  currentIndex: 2,

  //Filled
  changeFilledElement(width) {
    let calculation = `calc(${width} + 20px)`
    App.$.filledElement.style.width = calculation;
  },

  // distance calculations 
  getDistPercent(rangeWidth) {
    let totalpercentage = (rangeWidth - 40) / rangeWidth * 100;
    totalpercentage = Number(totalpercentage).toFixed(2);
    return totalpercentage;
  },

  getNextPosition(val, start, end) {
    let interval = (end - start) / 4;
    for (let i = 0; i < 5; i++) {
      if (val <= start + interval * i + 10 && val >= start + interval * i - 10) {
        return { index: i, value: "" + start + interval * i + "%" };
      }
    }
    if (val < 0)
      return { index: 0, value: "0%" };
    if (val > 100)
      return { index: 4, value: end + "%" };
    return { index: null, value: null };
  },

  //Slider
  sliderReadyToMove(e) {
    let [x, y] = [e.clientX, e.clientY];
    App.sliderState.pos.clientX = x;
    App.sliderState.pos.clientY = y;
    App.sliderState.moved = true;
  },

  moveSlider(cursorX, offsetLeft, rangeWidth) {
    let distance = this.distanceToPointer(rangeWidth, offsetLeft, cursorX);
    let { index, value } = App.getNextPosition(+distance, 0,
      this.getDistPercent(rangeWidth)
    );
    this.currentIndex = index;
    if (value && App.$.sliderElement.style.left !== value) {
      App.$.sliderElement.style.left = value;
      this.changeFilledElement(value);
      this.changeContentStates(index);
    }
  },

  sliderMoving(e) {
    if (!App.sliderState.moved) {
      return;
    }
    let cursorX = e.clientX;
    let offsetLeft = App.$.customInputElement.offsetLeft;
    let rangeWidth = App.$.rangeElement.getBoundingClientRect().width;
    this.moveSlider(cursorX, offsetLeft, rangeWidth);
    // steps
  },

  sliderStopped() {
    App.sliderState['moved'] = false;
  },

  //Content
  changeContentStates(index) {
    App.$.pageviewLabelElement.innerText = this.pageviewLabelStates[index];
    let priceperMonth = this.monthPriceLabelStates[index];
    if (this.discountApplied)
      priceperMonth = priceperMonth * 0.85;
    priceperMonth = Number(priceperMonth).toFixed(2);
    App.$.monthPriceLabelElement.innerText = priceperMonth;
  },

  //Billing
  toggleBilling() {
    this.changeContentStates(this.currentIndex);
  },

  handleBilling() {
    let isChecked = App.$.switchBillingElement.checked;
    if (this.discountApplied === isChecked)
      return;
    this.discountApplied = isChecked;
    this.toggleBilling();
  },

  distanceToPointer(rangeWidth, offsetLeft, cursorX) {
    let distance = 0;
    distance = cursorX - offsetLeft;
    distance = (distance / rangeWidth) * 100;
    distance = Number(distance).toFixed(2);
    return distance
  },

  // Main
  init() {
    App.clientDimensions.x = App.$.customInputElement.clientWidth;
    App.clientDimensions.y = App.$.customInputElement.clientHeight;
    App.distanceFromLeft = App.$.customInputElement.offsetLeft;

    let { width } = App.$.rangeElement.getClientRects()[0];
    let disVal = this.getDistPercent(width);
    disVal = disVal / 2 + "%";
    this.changeContentStates(this.currentIndex);
    App.$.sliderElement.style.left = disVal;
    this.changeFilledElement(disVal);

    this.handleBilling();

    window.addEventListener('resize', () => {
      App.clientDimensions.x = App.$.customInputElement.clientWidth;
      App.clientDimensions.y = App.$.customInputElement.clientHeight;
      App.distanceFromLeft = App.$.customInputElement.offsetLeft;
    })

    // Mouse
    App.$.sliderElement.addEventListener('mousedown', (e) => {
      App.sliderReadyToMove(e);
      document.body.style.cursor = 'grabbing';
    })

    window.addEventListener('mousemove', (e) => {
      App.sliderMoving(e);
    })

    window.addEventListener('mouseup', (e) => {
      App.sliderStopped(e);
      document.body.style.cursor = 'unset';
    })


    // Touch
    App.$.sliderElement.addEventListener('pointerdown', (e) => {
      App.sliderReadyToMove(e);
    })

    window.addEventListener('pointermove', (e) => {
      App.sliderMoving(e);
    })

    window.addEventListener('pointerup', (e) => {
      App.sliderStopped(e);
    })

    App.$.switchBillingElement.onchange = () => {
      this.handleBilling();
    }
  }
}


window.addEventListener('load', () => App.init());







