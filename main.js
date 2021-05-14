// var console = console || {}; // just in case
console.watch = function (oObj, sProp) {
  var sPrivateProp = "$_" + sProp + "_$"; // to minimize the name clash risk
  oObj[sPrivateProp] = oObj[sProp];

  // overwrite with accessor
  Object.defineProperty(oObj, sProp, {
    get: function () {
      return oObj[sPrivateProp];
    },

    set: function (value) {
      //console.log("setting " + sProp + " to " + value);
      debugger; // sets breakpoint
      oObj[sPrivateProp] = value;
    },
  });
};

window.onload = () => {
  console.log("window loaded");
};

const labelConfiguration = {
  "Left Ear": {
    title: "Left Ear",
    color: "rgb(0, 255, 0)",
    hotKey: "1",
    labelCategory: "Left Ear",
    // color: "rgba(44,160,255,1)",
    // hexColor: "#2ca02c",
  },
  "Left Eye": {
    title: "Left Eye",
    color: "rgb(0, 179, 0)",
    hotKey: "2",
    labelCategory: "Left Eye",
    // color: "rgba(31,119,180,1)",
    // hexColor: "#1f77b4",
  },
  "Right Ear": {
    title: "Right Ear",
    color: "rgb(255, 255, 0)",
    hotKey: "3",
    labelCategory: "Right Ear",
    // color: "rgba(255,127,14,1)",
    // hexColor: "#ff7f0e",
  },
  "Right Eye": {
    title: "Right Eye",
    color: "rgb(179, 179, 0)",
    hotKey: "4",
    labelCategory: "Right Eye",
    // color: "rgba(214,39,40,1)",
    // hexColor: "#d62728",
  },
  "Nose Tip": {
    title: "Nose Tip",
    color: "rgb(255, 0, 255)",
    hotKey: "5",
    labelCategory: "Nose Tip",
    // color: "rgba(148,103,189,1)",
    // hexColor: "#9467bd",
  },
  "Left Shoulder": {
    title: "Left Shoulder",
    color: "rgb(105, 24, 180)",
    hotKey: "6",
    labelCategory: "Left Shoulder",
    // color: "rgba(127,127,127,1)",
    // hexColor: "#7f7f7f",
  },
  "Left Elbow": {
    title: "Left Elbow",
    color: "rgb(138, 43, 226)",
    hotKey: "7",
    labelCategory: "Left Elbow",
    // color: "rgba(227,119,194,1)",
    // hexColor: "#e377c2",
  },
  "Left Wrist": {
    title: "Left Wrist",
    color: "rgb(168, 98, 234)",
    hotKey: "8",
    labelCategory: "Left Wrist",
    // color: "rgba(140,86,75,1)",
    // hexColor: "#8c564b",
  },
  "Right Shoulder": {
    title: "Right Shoulder",
    color: "rgb(157, 78, 21)",
    hotKey: "9",
    labelCategory: "Right Shoulder",
    // color: "rgba(23,190,207,1)",
    // hexColor: "#17becf",
  },
  "Right Elbow": {
    title: "Right Elbow",
    color: "rgb(224, 111, 31)",
    hotKey: "0",
    labelCategory: "Right Elbow",
    // color: "rgba(255,152,150,1)",
    // hexColor: "#ff9896",
  },
  "Right Wrist": {
    title: "Right Wrist",
    color: "rgb(234, 154, 98)",
    hotKey: "q",
    labelCategory: "Right Wrist",
    // color: "rgba(188,189,34,1)",
    // hexColor: "#bcbd22",
    // hotKey: "g",
  },
  "Left Hip": {
    title: "Left Hip",
    color: "rgb(0, 0, 179)",
    hotKey: "w",
    labelCategory: "Left Hip",
    // color: "rgba(174,199,232,1)",
    // hexColor: "#aec7e8",
    // hotKey: "h",
  },
  "Left Knee": {
    title: "Left Knee",
    color: "rgb(0, 0, 255)",
    hotKey: "e",
    labelCategory: "Left Knee",
    // color: "rgba(255,187,120,1)",
    // hexColor: "#ffbb78",
    // hotKey: "i",
  },
  "Left Ankle": {
    title: "Left Ankle",
    color: "rgb(77, 77, 255)",
    hotKey: "r",
    labelCategory: "Left Ankle",
    // color: "rgba(152,223,138,1)",
    // hexColor: "#98df8a",
    // hotKey: "j",
  },
  "Right Hip": {
    title: "Right Hip",
    color: "rgb(128, 0, 21)",
    hotKey: "t",
    labelCategory: "Right Hip",
    // color: "rgba(197,176,213,1)",
    // hexColor: "#c5b0d5",
    // hotKey: "k",
  },
  "Right Knee": {
    title: "Right Knee",
    color: "rgb(204, 0, 34)",
    hotKey: "y",
    labelCategory: "Right Knee",
    // color: "rgba(196,156,148,1)",
    // hexColor: "#c49c94",
    // hotKey: "n",
  },
  "Right Ankle": {
    title: "Right Ankle",
    color: "rgb(255, 26, 64)",
    hotKey: "u",
    labelCategory: "Right Ankle",
    // color: "rgba(247,182,210,1)",
    // hexColor: "#f7b6d2",
    // hotKey: "r",
  },
};

class KeypointInteractor {
  constructor() {
    this.eventHandlers = [];
    this.interceptors = [];
    this._dispatch = null;
  }

  async init() {
    this.ck = document.querySelector("crowd-keypoint");
    this.store = this.ck.store;
    this.labels = this.ck.labels;
    this.shadowRoot = this.ck.$["react-mount-point"];

    this.addInterceptor("SET_ACTIVE_LABEL_ID", this.setActiveLabel.bind(this));
    this.addInterceptor("SET_ANNOTATIONS", this.nextLabel.bind(this));
    this.addInterceptor("SET_LABELS", this.overrideLabelColors.bind(this));

    // Due to how React works, we have to override this label each time the
    // surrounding UI is changed.
    this.store.subscribe(this.overwriteNothingToAnnotate.bind(this));
    // The following events seem to suffice, but offer no advantages to the
    // above solution.
    // this.addInterceptor(
    //   "TOGGLE_NOTHING_TO_ANNOTATE",
    //   this.overwriteNothingToAnnotate.bind(this)
    // );
    // this.addInterceptor(
    //   "ENABLE_SUBMIT_BUTTON",
    //   this.overwriteNothingToAnnotate.bind(this)
    // );

    this._dispatch = this.store.dispatch.bind(this.store);
    const stubbedDispatch = this.dispatch.bind(this);
    Object.defineProperty(this.store, "dispatch", {
      get: function () {
        return stubbedDispatch;
      },
    });
  }

  overwriteNothingToAnnotate() {
    setTimeout(() => {
      const selector = "#nothing-to-annotate .awsui-checkbox-label";
      const label = this.shadowRoot.querySelector(selector);
      label.innerText = "No child present";
    }, 0);
  }

  setActiveLabel(obj) {
    const { id } = obj;
    this.activeLabel = this.labels.indexOf(id);
  }

  nextLabel() {
    const state = this.store.getState();
    if (
      !state.canvas.selectedAnnotationId &&
      state.tool.activeToolId == "keypoint"
    ) {
      const nextIdx = (this.activeLabel + 1) % this.labels.length;
      this.selectLabel(nextIdx);
    }
  }

  selectLabel(n) {
    this.store.dispatch({
      type: "SET_ACTIVE_LABEL_ID",
      id: this.labels[n],
    });
  }

  overrideLabelColors(message) {
    return { ...message, labels: labelConfiguration };
  }

  addEventListener(event, listener) {
    this.eventHandlers.push([event, listener]);
  }

  addInterceptor(action, interceptor) {
    this.interceptors.push([action, interceptor]);
  }

  async getElement(selector, refresh = 100, timeout = 10000) {
    const element = this.shadowRoot.querySelector(selector);
    if (element) {
      return element;
    }

    const self = this;

    let timePassed = 0;
    return new Promise((resolve, reject) => {
      const refreshInterval = setInterval(getElement, 100);

      function getElement() {
        timePassed += refresh;
        if (timePassed >= timeout) {
          clearInterval(refreshInterval);
          reject(new Error("Timeout"));
        }

        const element = self.shadowRoot.querySelector(selector);
        if (element) {
          clearInterval(refreshInterval);
          resolve(element);
        }
      }
    });
  }

  dispatch({ type, ...args }) {
    console.log("Incoming dispatch: ", { type, ...args });

    args = this.interceptors
      .filter(([action, _]) => action == type)
      .map(([_, interceptor]) => interceptor)
      .reduce((acc, interceptor) => interceptor(acc) || acc, args);

    console.log("Outgoing dispatch: ", { type, ...args });
    // this._dispatch.apply(object, { type, ...args });
    this._dispatch({ type, ...args });
  }
}

function uniqueKeypoints(data) {
  const { annotations, ...rest } = data;

  const annMapping = data.annotations.reduce(
    (acc, ann) => ({ ...acc, [ann.label]: ann }),
    {}
  );
  const uniqueAnns = Object.values(annMapping).sort((a, b) => a.id - b.id);
  return { annotations: uniqueAnns, ...rest };
}

function interceptLabel({ labels }) {}

async function waitForLabels() {
  return new Promise((resolve) => {
    const refreshInterval = setInterval(selectFirstLabel, 100);

    function selectFirstLabel() {
      if (getLabel(0)) {
        clearInterval(refreshInterval);
        resolve();
      }
    }
  });
}

const interactor = new KeypointInteractor();
interactor.addInterceptor("SET_ANNOTATIONS", uniqueKeypoints);

document
  .querySelector("crowd-keypoint")
  .addEventListener("crowd-element-ready", async (event) => {
    console.log("Crowd element ready");
    const target = event.target;
    const mount = target.$["react-mount-point"];

    // await waitForLabels();

    target.store.subscribe(() => {
      console.log(target.store.getState());
    });

    interactor.init();
    interactor.selectLabel(0);
  });

function stubFunction(object, property) {
  let func = object[property];

  function log() {
    console.log(property, ...arguments);
    func.apply(object, arguments);
  }

  Object.defineProperty(object, property, {
    get: function () {
      return log;
    },
  });
}

function observeObject(object, property, callback) {
  let data = object[property];
  console.debug("Watching " + property + " on", object);

  Object.defineProperty(object, property, {
    get: function () {
      return data;
    },

    set: function (value) {
      // console.log("setting " + sProp + " to " + value);
      // debugger; // sets breakpoint
      callback(value);
      data = value;
    },
  });
}

// SET_SELECTED_ANNOTATION_ID   # Expects numerical ID
// SET_ACTIVE_TOOL_ID           # Expects numerical ID
// DELETE_ANNOTATION            # Expects full annotation (or at least an object with an id)
// SET_ANNOTATION_LABEL         # Expects an object with a label?
// SET_ANNOTATIONS              # Expects a new list of annotations
// SET_ACTIVE_LABEL_ID          # Expects numerical ID
// ADD_ANNOTATION               # Expects a full annotation?
