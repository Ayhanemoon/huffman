class Node {
  constructor(_value, _char, _left, _right) {
    this.val = _value; // number of character occurrences
    this.char = _char; // character to be encoded
    this.left = _left;
    this.right = _right;
  }
}

class huffman {
  constructor(config) {
    this.str = config.text;
    this.colors = config.colors ? config.colors : this.getRandomColor(256);
    this.canvas = config.canvas ? config.canvas : null;
    this.random = config.random ? config.random : false;
    this.mode = config.mode ? config.mode : "code";

    this.hash = this.getHash(this.str);
    this.tree = this.getTree(this.hash);
    this.map = this.getMapping(this.tree);
    this.binaryStr = this.getBinaryStr(this.map, this.str);

    this.matrixSize = this.getMatrixSize(this.binaryStr);

    if (this.mode === "code") {
      return this.binaryStr;
    } else if (this.mode === "draw") {
      this.draw(this.binaryStr, this.canvas, this.colors, this.random);
    } else if (this.mode === "full") {
    }
  }

  getHash(str) {
    // count the frequency of characters
    let hash = {};
    for (let i = 0; i < str.length; i++) {
      hash[str[i]] = ~~hash[str[i]] + 1;
    }
    return hash;
  }

  // Huffman tree
  getTree(hash) {
    let forest = [];

    for (let char in hash) {
      let node = new Node(hash[char], char);
      forest.push(node);
    }

    /* stores the merged nodes, because any node 
        in the forest cannot be deleted, otherwise. Left. Right 
        will not find the node */
    let allNodes = [];

    while (forest.length !== 1) {
      //Find the two smallest trees in the forest and merge them
      forest.sort((a, b) => {
        return a.val - b.val;
      });

      let node = new Node(forest[0].val + forest[1].val, "");
      allNodes.push(forest[0]);
      allNodes.push(forest[1]);
      node.left = allNodes[allNodes.length - 2]; // the left subtree places words with low frequency
      node.right = allNodes[allNodes.length - 1]; // the right subtree places the word frequency high

      //Delete the two smallest trees
      forest = forest.slice(2);
      //Added tree join
      forest.push(node);
    }

    return forest[0];
  }

  getMapping(tree) {
    let hash = {}; // cross reference table
    let traversal = (node, curPath) => {
      if (!node.length && !node.right) return;
      if (node.left && !node.left.left && !node.left.right) {
        hash[node.left.char] = curPath + "0";
      }
      if (node.right && !node.right.left && !node.right.right) {
        hash[node.right.char] = curPath + "1";
      }
      //Traverse to the left and add 0 to the path
      if (node.left) {
        traversal(node.left, curPath + "0");
      }
      //Go right and add 1 to the path
      if (node.right) {
        traversal(node.right, curPath + "1");
      }
    };
    traversal(tree, "");
    return hash;
  }

  // binary encoding
  getBinaryStr(map, originStr) {
    let result = "";
    for (let i = 0; i < originStr.length; i++) {
      result += map[originStr[i]];
    }
    return result;
  }

  // get matrix cols & rows size
  getMatrixSize(binaryStr) {
    return ~~Math.sqrt(binaryStr.length) + 1;
  }

  // get random color for each segment
  getRandomColor(n) {
    let colors = [];
    for (let i = 0; i < 2; i++) {
      colors[i] = [];
      for (let j = 0; j < 3; j++) {
        colors[i][j] = ~~(Math.random() * n);
      }
    }
    return colors;
  }

  // draw matrix for canvas
  draw(binaryStr, canvas, colors, random) {
    let cols = this.getMatrixSize(binaryStr);
    let rows = cols-1;

    if (canvas.getContext) {
      let ctx = canvas.getContext("2d");
      ctx.canvas.width = cols * 10;
      ctx.canvas.height = rows * 10;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * 10;
          let y = j * 10;
          let index = j * cols + (i + j);
          if (random) {
            if (binaryStr[index] == 0) {
              ctx.fillStyle = `rgb(${colors[0][0]},${colors[0][1]},${colors[0][2]})`;
            } else {
              ctx.fillStyle = `rgb(${colors[1][0]},${colors[1][1]},${colors[1][2]})`;
            }
          } else {
            if (binaryStr[index] == 0) {
              ctx.fillStyle = colors[0];
            } else {
              ctx.fillStyle = colors[1];
            }
          }
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }
  }

  // make canvas downloadable
  static download(canvas) {
    let link = document.createElement("a");
    link.download = "huffmanCode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}
