    (function() {
      "use strict";
      const canvas = {
        Main: document.getElementById('canvas'),
        Cloud1: document.getElementById('canvasCloud1'),
        Cloud2: document.getElementById('canvasCloud2'),
        Points: document.getElementById('canvasPointsCounter'),
        Level: document.getElementById('canvasLevelCounter'),
        Background: document.getElementById('canvasBg'),
        Menu: document.getElementById('canvasMenu'),
        DeepMenu: document.getElementById('canvasDeepMenu'),
        ButtonLeft: document.getElementById('canvasButtonLeft'),
        ButtonRight: document.getElementById('canvasButtonRight'),
        BackButton: null,
        NextButton: null,
        get width() {
          return this.Main.width;
        },
        get height() {
          return this.Main.height;
        }
      };
      const context = {
        Main: canvas.Main.getContext('2d'),
        Cloud1: canvas.Cloud1.getContext('2d'),
        Cloud2: canvas.Cloud2.getContext('2d'),
        Points: canvas.Points.getContext('2d'),
        Level: canvas.Level.getContext('2d'),
        Background: canvas.Background.getContext('2d'),
        Menu: canvas.Menu.getContext('2d'),
        DeepMenu: canvas.DeepMenu.getContext('2d'),
        ButtonLeft: canvas.ButtonLeft.getContext('2d'),
        ButtonRight: canvas.ButtonRight.getContext('2d')
      };
      const images = {
        cloud1: document.getElementById('cloud1'),
        cloud2: document.getElementById('cloud2'),
        button: document.getElementById('roundButtonGreen'),
        buttonActive: document.getElementById('roundButtonGreenActive')
      };
      const buttonSize = 140;
      const squareSize = 50;
      let canvases = [];
      let contexes = [];

      //        debug only
      const infoDiv = document.getElementById('info');
      const answerBox = document.getElementById('answerBox');

      const wordsSet1 = [
        ['wujek', 'wójek', 0, 'uncle'],
        ['tchórz', 'tchurz', 0, 'coward'],
        ['krul', 'król', 1, 'king'],
        ['pułka', 'półka', 1, 'shelf'],
        ['klawiatura', 'klawiatóra', 0, 'keyboard'],
        ['żók', 'żuk', 1, 'beetle']
      ];
      const points = {
        offsetX: 32,
        offsetY: 26,
        textOffsetX: 4,
        textOffsetY: 26,
        messageDrawn: false
      };
      const level = {
        messageDrawn: false,
        offsetX: 28,
        offsetY: 32
      };
      const results = {
        winCondition: 600,
        won: false,
        winMessage: "Wygrana!",
        lostMessage: "Przegrana"
      };
      const gameStateObject = {
        menuDrawn: false,
        deepMenuDrawn: false,
        stageDrawn: false,
        resultsDrawn: false,
        state: "menu"
      };
      const roundInfo = {
        currentLevel: -3,
        correctAnswer: -1,
        points: 0,
        goodAnswers: 0,
        badAnswers: 0,
        answered: 0,
        currentWord: 0,
        currentLeftWord: "empty",
        currentRightWord: "empty",
        //for the time being only one wordset is active
        currentWordset: null,
        questionsOccured: [],
        lastButton: null,
        lastAnswer: null
      };
      const menuObject = {
        welcomeText: "Nowa gra",
        currentLevel: "Wybierz poziom:"
      };
      const deepMenuObject = {
        width: canvasDeepMenu.width,
        height: canvasDeepMenu.height
      };
      const cloud1Object = {
        x: -30,
        y: -20,
        width: images.cloud1.width,
        height: images.cloud1.height,
        direction: 1,
        speed: 1,
        image: images.cloud1
      };
      const cloud2Object = {
        x: 450,
        y: 70,
        width: images.cloud2.width,
        height: images.cloud2.height,
        direction: -1,
        speed: -0.5,
        image: images.cloud2
      };
      const timer = {
        interval: 8000,
        id: null

      };
      const buttonMenuObject = {
        textX: buttonSize / 2 - menuObject.welcomeText.length * 7,
        textY: buttonSize / 2 + 10,
        width: buttonSize,
        height: buttonSize,
        image: images.button,
        active: images.buttonActive
      };
      const buttonLeftObject = {
        x: 280,
        y: 300,
        width: buttonSize,
        height: buttonSize,
        image: images.button,
        active: images.buttonActive
      };
      const buttonRightObject = {
        x: 480,
        y: 300,
        width: buttonSize,
        height: buttonSize,
        image: images.button,
        active: images.buttonActive
      };
      //--------------------------- game functions ----------------------------------------------------------------------
      function checkIfWon() {
        results.won = (roundInfo.points >= results.winCondition) ? true : false;
      }

      function buttonClick(e) {
        if(gameStateObject.state === "menu") {
          // context.Menu.clearRect(0, 0, buttonSize, buttonSize);
          gameStateObject.state = "deepMenu";
        } else if(gameStateObject.state === "deepMenu") {
          roundInfo.currentWordset = Object.create(wordsets[roundInfo.currentLevel - 1]);
          gameStateObject.state = "playing";
        } else if(gameStateObject.state === "playing") {
          resetTimer(roundInfo.currentWordset);
          if(e.target.id === "canvasButtonLeft") {
            // attachStageEvents();
            roundInfo.lastButton = 0;
            roundInfo.lastAnswer = 0;
          }
          if(e.target.id === "canvasButtonRight") {
            // attachStageEvents();
            roundInfo.lastButton = 1;
            roundInfo.lastAnswer = 1;
          }
          if(e.target.id === "canvasButtonLeft" || e.target.id === "canvasButtonRight") {
            //update info
            roundInfo.currentWord++;
            roundInfo.answered++;
            //run some operations
            checkAnswer();
            drawWords(wordsets[roundInfo.currentLevel - 1]);
            drawStage();
          }
        }
        // else if (gameStateObject.state === "finished") {

        // }
      }

      function activateButton(button, context) {
        let whichButton;
        if(gameStateObject.state === "menu") {
          context.drawImage(button.active, 0, 0);
          drawMenuText();
        }
        // if (gameStateObject.state === "deepMenu") {

        // }
        if(gameStateObject.state === "playing") {
          whichButton = (button === buttonLeftObject) ?
            roundInfo.currentLeftWord :
            roundInfo.currentRightWord;
          context.clearRect(0, 0, button.width, button.height);
          context.drawImage(button.active, 0, 0);
          setButtonText(context, button, whichButton);
        }

        window.addEventListener('click', buttonClick, false);
      }

      function deactivateButton(button, context) {
        let whichButton;
        if(gameStateObject.state === "menu") {
          context.clearRect(0, 0, buttonSize, buttonSize);
          context.drawImage(button.image, 0, 0);
          drawMenuText();
        }
        // if (gameStateObject.state === "deepMenu") {

        // }
        if(gameStateObject.state === "playing") {
          whichButton = (button === buttonLeftObject) ?
            roundInfo.currentLeftWord :
            roundInfo.currentRightWord;
          context.clearRect(0, 0, button.width, button.height);
          context.drawImage(button.image, 0, 0);
          setButtonText(context, button, whichButton);
        }

        window.removeEventListener('click', buttonClick, false);
      }

      function drawWords() {
        // let order = randomOf(0,1);
        if(roundInfo.currentWordset[0] !== undefined) {
          roundInfo.currentLeftWord = roundInfo.currentWordset[0][0]; //[order];
          roundInfo.currentRightWord = roundInfo.currentWordset[0][1]; //[1-order];
          roundInfo.correctAnswer = roundInfo.currentWordset[0][2];
          roundInfo.currentWordset.shift();
        }
      }

      // function updateTimeBar() {
      // }

      function resetTimer() {
        clearTimeout(timer.id);
        timer.id = setInterval(nextWords, timer.interval, roundInfo.currentWordset);
      }

      function stopTimer() {
        clearTimeout(timer.id);
      }

      function nextWords() {
        let amountOfWords = wordsets[roundInfo.currentLevel - 1].length;
        if(roundInfo.currentWord >= amountOfWords) {
          stopTimer();
          gameStateObject.state = "finished";
          return;
        }
        if(gameStateObject.state === "playing") {
          roundInfo.currentWord++;
          roundInfo.badAnswers++;
          drawWords(roundInfo.currentWordset);
          drawStage();
          updatePoints();
        }
      }

      function startRound() {
        drawWords();
        drawStage();
        // roundInfo.currentWord++;
        timer.id = setInterval(nextWords, timer.interval, roundInfo.currentWordset);
      }

      function setButtonText(context, button, text) {
        context.font = "26px Biorhyme";
        context.fillText(text, 60 - text.length * 4, button.height / 2 + 6);
      }

      function randomOf(min, max) {
        return Math.floor(Math.random() * max) - min;
      }

      function showInfo() {
        infoDiv.innerHTML = 'current word: ' + roundInfo.currentWord + '<br>' +
          'good answers: ' + roundInfo.goodAnswers + '<br>' +
          'badAnswers: ' + roundInfo.badAnswers + '<br>' +
          'lastAnswer: ' + roundInfo.lastAnswer + '<br>' +
          'correct answer is : ' + roundInfo.correctAnswer + '<br>' +
          'level chosen : ' + roundInfo.currentLevel + '<br>' +
          'points: ' + roundInfo.points + '<br>';
      }

      function update(progress) {
        // Update the state of the world for the elapsed time since last render
        updateCloud(cloud1Object);
        updateCloud(cloud2Object);
        // showInfo();
      }

      function updateCloud(cloud) {
        if(cloud.x > canvas.width + cloud.width * 0.6) {
          cloud.x = -cloud.width;
        }
        if(cloud.x + cloud.width < 0) {
          cloud.x = canvas.width + cloud.width * 0.4;
        }
        cloud.x += cloud.speed;
      }

      function drawMenuText() {
        context.Menu.font = "28px Biorhyme";
        context.Menu.fillText(menuObject.welcomeText,
          buttonMenuObject.textX,
          buttonMenuObject.textY);
      }

      function drawMenu() {
        drawBackground();
        context.Menu.drawImage(images.button, 0, 0);
        drawMenuText();
      }
      //=====================================================================================================================
      //=====================================================================================================================
      function modifyHexColor(color, r, g, b) {
        let red = color.slice(1, 3);
        let green = color.slice(3, 5);
        let blue = color.slice(5, 7);

        function workOnPartialColor(partialColor, addMe) {
          partialColor = parseInt(partialColor, 16);
          partialColor += addMe;
          partialColor = (partialColor > 255) ? 255 : partialColor;
          if(partialColor < 16) {
            partialColor = '0' + partialColor.toString(16);
          } else {
            partialColor = partialColor.toString(16);
          }
          return partialColor;
        }
      }

      function highlightSquare() {
        let index = this.id - 1;
        previousColor[index] = contexes[index].fillStyle;
        let newColor = modifyHexColor(previousColor[index], 70, 70, 70);
        contexes[index].fillStyle = newColor;
        contexes[index].fillRect(0, 0, squareSize, squareSize);
      }

      function unhighlightSquare() {
        let index = this.id - 1;
        contexes[index].fillStyle = previousColor[index];
        contexes[index].fillRect(0, 0, squareSize, squareSize);
      }

      function squareClicked(e) {
        if(this.classList.contains("clicked")) {
          this.removeAttribute("class");
          unhighlightSquare.bind(this)();
          this.addEventListener('mouseover', highlightSquare);
          this.addEventListener('mouseout', unhighlightSquare);
        } else {
          this.setAttribute("class", "clicked");
          this.removeEventListener('mouseout', unhighlightSquare);
          this.removeEventListener('mouseover', highlightSquare);
        }
        // console.log('square [id= ' + this.id     + '] clicked');
      }

      function pinEventsToSquares() {
        canvases[canvases.length - 1].addEventListener('mouseover', highlightSquare);
        canvases[canvases.length - 1].addEventListener('click', squareClicked);
        canvases[canvases.length - 1].addEventListener('mouseout', unhighlightSquare);
        // canvases[canvases.length-1].removeEventListener('mouseout', highlightSquare);
      }

      function drawCanvasSquares() {
        const padding = 2;
        for(let i = 0; i < 3; i++) {
          for(let j = 0; j < 6; j++) {
            canvases.push(document.createElement("canvas"));
            canvases[canvases.length - 1].width = squareSize;
            canvases[canvases.length - 1].height = squareSize;
            canvases[canvases.length - 1].id = j + i * 6 + 1;
            canvases[canvases.length - 1].style.position = "absolute";
            canvases[canvases.length - 1].style.top = (i * (squareSize + padding)) + 'px';
            canvases[canvases.length - 1].style.left = (j * (squareSize + padding)) + 'px';
            document.querySelector("#windows").insertBefore(canvases[canvases.length - 1], canvasDeepMenu);
            contexes.push(canvases[canvases.length - 1].getContext('2d'));
            contexes[contexes.length - 1].fillStyle = 'rgb(' + (i * 2 * squareSize / 2 + j * squareSize / 2) + ', ' +
              (i * squareSize / 3 + j * squareSize * 2 / 3) +
              ', 205)';
            contexes[contexes.length - 1].fillRect(0, 0, squareSize, squareSize);
            pinEventsToSquares();
          }
        }
      }
      //=====================================================================================================================
      //=====================================================================================================================

      function drawDeepMenuSquares() {
        let squareSize = 50;
        let margin = 15;
        let padding = 2;
        let number = 0;
        let numberOffsetX = 0;
        //check gradient area cuz something wrong
        let gradient = context.DeepMenu.createLinearGradient(0, 175, 0, deepMenuObject.height * 1.5);
        gradient.addColorStop("0", "#0553af");
        gradient.addColorStop("1", "#00b6ff");
        // context.DeepMenu.fillStyle = '#999';
        for(let i = 0; i < 6; i++) {
          for(let j = 0; j < 3; j++) {
            number = 1 + j * 6 + i;
            numberOffsetX = (number > 9) ? numberOffsetX = -4 : numberOffsetX = 8;
            context.DeepMenu.fillStyle = gradient;
            context.DeepMenu.fillRect(margin + i * (squareSize + padding), margin + j * (squareSize + padding) + 160, squareSize, squareSize);

            context.DeepMenu.font = "bold 36px Georgia";
            context.DeepMenu.fillStyle = '#ffff5c';
            context.DeepMenu.fillText(number, squareSize / 2 + numberOffsetX + i * squareSize + i * 2, 50 + j * 2 + 160 + j * squareSize);
          }
        }
      }
      //=====================================================================================================================
      //=====================================================================================================================
      function drawDeepMenu() {
        // Create gradient
        let gradient = context.DeepMenu.createLinearGradient(0, 0, deepMenuObject.width, 0);
        let gradient2 = context.DeepMenu.createLinearGradient(0, 0, deepMenuObject.width, deepMenuObject.height);
        gradient.addColorStop("0", "#00005b");
        gradient.addColorStop("0.6", "#005160");
        gradient.addColorStop("1", "#4d00af");
        // Fill with gradient
        context.DeepMenu.fillStyle = gradient;
        context.Menu.clearRect(0, 0, buttonSize, buttonSize);
        context.DeepMenu.clearRect(0, 0, deepMenuObject.width, deepMenuObject.height);
        context.DeepMenu.font = "bold 36px Irish Grover";
        context.DeepMenu.fillText(menuObject.currentLevel, 30, 140);

        gradient2.addColorStop('0', '#239fff');
        gradient2.addColorStop('0.4', '#a5e1ff');
        gradient2.addColorStop('0.6', '#a5e1ff');
        gradient2.addColorStop('1', '#00c7f3');
        // context.DeepMenu.fillStyle = '#9bc7ff';
        context.DeepMenu.fillStyle = gradient2;
        context.DeepMenu.fillRect(0, 160, deepMenuObject.width, deepMenuObject.height);

        context.DeepMenu.strokeStyle = "#000";
        context.DeepMenu.lineWidth = 2;
        context.DeepMenu.strokeRect(1, 159, deepMenuObject.width - 2, deepMenuObject.height - 160);

        drawDeepMenuSquares();
        // drawCanvasSquares();
      }

      function drawBackground() {
        //background
        let gradient = context.Background.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop('0', '#0553af');
        gradient.addColorStop('1.0', '#a5ffff');
        // context.Background.fillStyle = '#86bddf';
        context.Background.fillStyle = gradient;
        context.Background.fillRect(0, 0, canvas.width, canvas.height);
        //clouds
        context.Cloud1.drawImage(images.cloud1, cloud1Object.x, cloud1Object.y);
        context.Cloud2.drawImage(images.cloud2, cloud2Object.x, cloud2Object.y);
        //grass
        let grass = document.getElementById('grass');
        context.Background.drawImage(grass, 0, 405);
      }

      function drawStage() {
        updatePoints();
        context.DeepMenu.clearRect(0, 0, canvasDeepMenu.width, canvasDeepMenu.height);
        //buttons: left
        context.ButtonLeft.drawImage(buttonLeftObject.image, 0, 0);
        setButtonText(context.ButtonLeft, buttonLeftObject, roundInfo.currentLeftWord);
        //.. and right
        context.ButtonRight.drawImage(buttonRightObject.image, 0, 0);
        setButtonText(context.ButtonRight, buttonRightObject, roundInfo.currentRightWord);
      }

      function drawCloud(context, cloud) {
        // context.fillRect(cloud.x-1, cloud.y, cloud.width+2, cloud.height);
        context.clearRect(cloud.x - Math.ceil(cloud.speed),
          cloud.y,
          cloud.width + Math.abs(cloud.speed * 2),
          cloud.height);
        context.drawImage(cloud.image, cloud.x, cloud.y);
      }

      function drawButton(context, button) {
        // context.clearRect(button.x, button.y, button.width, button.height);
        context.drawImage(button.image, button.x, button.y);
      }

      function drawResults() {
        checkIfWon();
        context.ButtonLeft.clearRect(0, 0, canvasButtonLeft.width, canvasButtonLeft.height);
        context.ButtonRight.clearRect(0, 0, canvasButtonRight.width, canvasButtonRight.height);
        bringToTheTop(canvasDeepMenu);
        context.DeepMenu.fillStyle = 'black';
        context.DeepMenu.font = "bold 36px Verdana";
        (results.won) ? context.DeepMenu.fillText(results.winMessage, 80, 100):
          context.DeepMenu.fillText(results.lostMessage, 80, 100);
        //show good and answers count ..
        context.DeepMenu.font = "bold 24px Georgia";
        let text1 = "Dobre odpowiedzi: ";
        let text1width = Math.round(context.DeepMenu.measureText(text1).width);
        context.DeepMenu.fillText(text1, 20, 180);
        context.DeepMenu.fillStyle = "green";
        context.DeepMenu.fillText(roundInfo.goodAnswers, 20 + text1width + 10, 180); //10 for padding
        //and bad answers..
        let text2 = "Błędy: ";
        let text2width = Math.round(context.DeepMenu.measureText(text2).width);
        context.DeepMenu.fillStyle = "black";
        context.DeepMenu.fillText(text2, 20, 180 + 30 + 10);
        context.DeepMenu.fillStyle = "red";
        context.DeepMenu.fillText(roundInfo.badAnswers, 20 + text2width + 10, 180 + 30 + 10); //10 for padding
        //show buttons to control what to do next
        (results.won) ? showEndButtons(true): showEndButtons(false);

        gameStateObject.resultsDrawn = true;
      }

      function draw() {
        // Draw the state of the world
        drawCloud(context.Cloud1, cloud1Object);
        drawCloud(context.Cloud2, cloud2Object);

      }

      function resetShadow(context) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
      }

      function menuActivateListener() {
        activateButton(buttonMenuObject, context.Menu);
      }

      function menuDeactivateListener() {
        deactivateButton(buttonMenuObject, context.Menu);
      }

      function attachMenuEvents() {
        canvasMenu.addEventListener('mousemove', menuActivateListener, false);
        canvasMenu.addEventListener('mouseout', menuDeactivateListener, false);
      }

      function deattachMenuEvents() {

        canvasMenu.removeEventListener('mousemove', menuActivateListener, false);
        canvasMenu.removeEventListener('mouseout', menuDeactivateListener, false);
      }

      function attachStageEvents() {
        canvasButtonLeft.addEventListener('mousemove', activateButton.bind(this, buttonLeftObject, context.ButtonLeft));
        canvasButtonLeft.addEventListener('mouseout', deactivateButton.bind(this, buttonLeftObject, context.ButtonLeft));

        canvasButtonRight.addEventListener('mousemove', activateButton.bind(this, buttonRightObject, context.ButtonRight));
        canvasButtonRight.addEventListener('mouseout', deactivateButton.bind(this, buttonRightObject, context.ButtonRight));
      }

      function deattachStageEvents() {
        canvasButtonLeft.removeEventListener('mousemove', activateButton.bind(this, buttonLeftObject, context.ButtonLeft));
        canvasButtonLeft.removeEventListener('mouseout', deactivateButton.bind(this, buttonLeftObject, context.ButtonLeft));

        canvasButtonRight.removeEventListener('mousemove', activateButton.bind(this, buttonRightObject, context.ButtonRight));
        canvasButtonRight.removeEventListener('mouseout', deactivateButton.bind(this, buttonRightObject, context.ButtonRight));
      }




      function nextButtonActivateListener(e) {
        // console.log('x: ' + e.clientX + '/ y: ' + e.clientY);
      }

      function nextButtonDeactivateListener(e) {

      }

      function attachNextButtonEvents() {
        // canvas.addEventListener('mousemove', nextButtonActivateListener, false);
        // canvas.addEventListener('mouseout', nextButtonDeactivateListener, false);
      }

      function deattachNextButtonEvents() {
        // canvas.removeEventListener('mousemove', nextButtonActivateListener, false);
        // canvas.removeEventListener('mouseout', nextButtonDeactivateListener, false);
      }

      function backButtonActivateListener(e) {
        // console.log('x: ' + e.clientX + '/ y: ' + e.clientY);

        function checkIfButtonClicked(e) {
          let image = canvasDeepMenu.getImageData();
          console.dir(image);
        }
        checkIfButtonClicked(e);
      }

      function backButtonDeactivateListener(e) {

      }

      function attachBackButtonEvents() {
        canvasBackButton.addEventListener('mousemove', nextButtonActivateListener, false);
        canvasBackButton.addEventListener('mouseout', nextButtonDeactivateListener, false);
      }

      function deattachBackButtonEvents() {
        canvasBackButton.removeEventListener('mousemove', nextButtonActivateListener, false);
        canvasBackButton.removeEventListener('mouseout', nextButtonDeactivateListener, false);
      }






      function whichLevelChosen(e) {
        let computedStyle = window.getComputedStyle(canvasDeepMenu);
        let x = 1 + e.pageX - 15 - parseInt(computedStyle.left, 10);
        let y = 1 + e.pageY - 175 - parseInt(computedStyle.top, 10);
        roundInfo.currentLevel = Math.ceil(x / 52) + Math.floor(y / 52) * 6;

        // answerBox.innerHTML = 'x: ' + x + ', y: ' + y;
      }

      function deepMenuActivateListener(event) {
        // activateButton(deepMenuObject, context.DeepMenu);
        whichLevelChosen(event);
      }

      function deepMenuDeactivateListener() {
        deactivateButton(deepMenuObject, context.DeepMenu);
      }

      function attachDeepMenuEvents() {
        // canvasDeepMenu.addEventListener('mouseover', deepMenuActivateListener, false);
        canvasDeepMenu.addEventListener('click', deepMenuActivateListener, false);
        // canvasDeepMenu.addEventListener('mouseout', deepMenuDeactivateListener, false);
      }

      function deattachDeepMenuEvents() {
        // canvasDeepMenu.removeEventListener('mouseover', deepMenuActivateListener, false);
        canvasDeepMenu.removeEventListener('click', deepMenuActivateListener, false);
        // canvasDeepMenu.removeEventListener('mouseout', deepMenuDeactivateListener, false);
      }

      function bringToTheTop(cnv, zIndex = 0) {
        if(zIndex !== 0) {
          cnv.style.zIndex = zIndex;
        } else {
          let windows = document.getElementById('windows');
          let children = windows.children;
          for(let x = 0; x < children.length; x++) {
            if(children[x].id !== cnv.id) {
              children[x].style.zIndex = 1;
            } else {
              children[x].style.zIndex = 100;
            }
          }
        }
      }

      function checkAnswer() {
        if(roundInfo.lastAnswer == roundInfo.correctAnswer) {
          roundInfo.goodAnswers++;
        } else {
          roundInfo.badAnswers++;
          // wrongAnswerEffect();
        }
      }

      function drawPoints() {
        context.Points.font = "32px Georgia";
        if(!points.messageDrawn) {

          context.Points.fillStyle = '#d50004';
          context.Points.shadowColor = '#333';
          context.Points.shadowBlur = 5;
          context.Points.shadowOffsetX = 2;
          context.Points.shadowOffsetY = 2;
          context.Points.rotate(1 * Math.PI / 180);
          context.Points.strokeStyle = "black";
          context.Points.lineWidth = 2;
          context.Points.strokeRect(10, 2, 100, 40);
          context.Points.fillRect(10, 2, 100, 40);


          context.Points.rotate(-2 * Math.PI / 180);
          context.Points.font = "32px Georgia";
          context.Points.fillStyle = '#fff';
          // resetShadow(ctxP);
          context.Points.rotate(3 * Math.PI / 180);
          context.Points.strokeText("wynik ", points.offsetX / 2, points.offsetY + 4);
          context.Points.fillText("wynik ", points.offsetX / 2, points.offsetY + 4);
          points.messageDrawn = true;
          context.Points.rotate(-5 * Math.PI / 180);
        }
        context.Points.shadowColor = '#333';
        context.Points.shadowBlur = 6;
        context.Points.shadowOffsetX = 3;
        context.Points.shadowOffsetY = 3;
        context.Points.fillStyle = '#ee1123';
        context.Points.clearRect(-5, points.offsetY + 25, 130, 66);
        context.Points.lineWidth = 0.8;
        context.Points.strokeRect(0, points.offsetY + 35, 100, 26);
        context.Points.fillRect(0, points.offsetY + 35, 100, 26);


        context.Points.shadowBlur = 2;
        context.Points.shadowOffsetX = 2;
        context.Points.shadowOffsetY = 2;

        context.Points.fillStyle = '#fff';
        context.Points.font = "44px Georgia";
        context.Points.strokeText(roundInfo.points, points.textOffsetX, points.textOffsetY * 3.3);
        context.Points.fillText(roundInfo.points, points.textOffsetX, points.textOffsetY * 3.3);
      }

      function updatePoints() {
        roundInfo.points = roundInfo.goodAnswers * 200 - roundInfo.badAnswers * 80;
        if(roundInfo.points < 0) {
          roundInfo.points = 0;
        }
        drawPoints();
      }
      //================== NOT WORKING YET =============================================================
      function wrongAnswerEffect() {
        console.log("wrong answer effect");
        bringToTheTop(canvas);
        let timeOfEffect = 500;
        let timeOfFrame = timeOfEffect / 10;
        context.Main.fillStyle = "#220000";

        function redScreen() {
          context.Main.fillStyle = "#ff0000";
        }

        function normalScreen() {
          context.Main.fillStyle = "#220000";
        }
        let time = setInterval(redScreen, timeOfFrame);
        setTimeout(function() {
          clearInterval(time);
        }, timeOfEffect / 2);
        time = setInterval(normalScreen, timeOfFrame);
        setTimeout(function() {
          clearInterval(time);
        }, timeOfEffect / 2);
        context.Main.clearRect(0, 0, canvas.width, canvas.height);
        bringToTheTop(canvas, 10);
      }
      //===============================================================================================
      function displayCurrentLevel() {
        context.Level.font = "32px Georgia";
        if(!level.messageDrawn) {
          context.Level.shadowColor = '#333';
          context.Level.shadowBlur = 3;
          context.Level.shadowOffsetX = 2;
          context.Level.shadowOffsetY = 2;
          context.Level.fillStyle = '#af0000';
          context.Level.strokeRect(5, 5, 120, 55);
          context.Level.fillRect(5, 5, 120, 55);
          context.Level.font = "32px Georgia";
          context.Level.fillStyle = '#fff';
          context.Level.strokeText("poziom ", level.offsetX / 2, level.offsetY);
          context.Level.fillText("poziom ", level.offsetX / 2, level.offsetY);
          level.messageDrawn = true;
        }
        context.Level.clearRect(canvasLevelCounter.width / 4, level.offsetY + 10, canvasLevelCounter.width / 2, 40);
        context.Level.fillStyle = '#dd0012';
        context.Level.strokeRect(canvasLevelCounter.width / 4, level.offsetY + 10, canvasLevelCounter.width / 2, 40);
        context.Level.fillRect(canvasLevelCounter.width / 4, level.offsetY + 10, canvasLevelCounter.width / 2, 40);

        context.Level.font = "44px Georgia";
        context.Level.fillStyle = '#fff';
        context.Level.strokeText(roundInfo.currentLevel, level.offsetX * 2, level.offsetY * 2.3);
        context.Level.fillText(roundInfo.currentLevel, level.offsetX * 2, level.offsetY * 2.3);
      }

      function showBackButton(context) {
        let gradient = context.createLinearGradient(0, 0, 120, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.8", "blue");
        gradient.addColorStop("1", "#a7f");
        context.fillStyle = "#2d32ff";
        context.font = "24px verdana";
        context.lineWidth = 2.5;
        context.shadowColor = "#333";
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.translate(-10, 80);
        context.rotate(Math.PI);
        context.beginPath();
        context.moveTo(2, 15);
        context.lineTo(20, 60);
        context.lineTo(96, 56);
        context.lineTo(94, 70);
        context.lineTo(130, 40);
        context.lineTo(85, 10);
        context.lineTo(93, 27);
        context.closePath();
        context.stroke();
        context.fill();
        context.rotate(-Math.PI);
        context.lineWidth = 1;
        context.shadowBlur = 3;
        context.shadowColor = "#333";
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.fillStyle = "white";
        context.translate(10, -80);
        context.strokeText("wstecz", -120, 46);
        context.fillText("wstecz", -120, 46);
      }

      function showNextButton(context) {
        let gradient = context.createLinearGradient(0, 0, 120, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.8", "blue");
        gradient.addColorStop("1", "#a7f");
        context.fillStyle = "#2d32ff";
        context.font = "24px verdana";
        context.lineWidth = 2.5;
        context.shadowColor = "#333";
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.translate(50, 0);
        context.beginPath();
        context.moveTo(2, 15);
        context.lineTo(20, 60);
        context.lineTo(96, 56);
        context.lineTo(94, 70);
        context.lineTo(130, 40);
        context.lineTo(85, 10);
        context.lineTo(93, 27);
        context.closePath();
        context.stroke();
        context.fill();
        context.lineWidth = 1;
        context.shadowBlur = 3;
        context.shadowColor = "#333";
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.fillStyle = "white";
        context.strokeText("dalej", 30, 48);
        context.fillText("dalej", 30, 48);
        context.translate(-50, 0);
      }

      function showEndButtons(won) {
        if(won) {
          bringToTheTop(context.DeepMenu);
          context.DeepMenu.translate(150, 240);
          showBackButton(context.DeepMenu);
          showNextButton(context.DeepMenu);
          context.DeepMenu.translate(-150, -240);
        } else {
          bringToTheTop(context.DeepMenu);
          context.DeepMenu.translate(150, 240);
          showBackButton(context.DeepMenu);
          showNextButton(context.DeepMenu);
          context.DeepMenu.translate(-150, -240);
        }
      }

      function checkGameState() {
        if(!gameStateObject.menuDrawn && gameStateObject.state === "menu") {
          bringToTheTop(canvasMenu);
          drawMenu();
          attachMenuEvents();
          gameStateObject.menuDrawn = true;
        }
        if(!gameStateObject.deepMenuDrawn && gameStateObject.state === "deepMenu") {
          deattachMenuEvents();
          bringToTheTop(canvasDeepMenu);
          drawDeepMenu();

          gameStateObject.deepMenuDrawn = true;
          attachDeepMenuEvents();
        }
        if(!gameStateObject.stageDrawn && gameStateObject.state === "playing") {
          deattachDeepMenuEvents();
          attachStageEvents();
          bringToTheTop(canvasButtonLeft);
          bringToTheTop(canvasButtonRight);
          displayCurrentLevel();
          startRound(roundInfo.currentWordset);
          gameStateObject.stageDrawn = true;
        }
        if(gameStateObject.state === "playing" && roundInfo.currentWord >= wordsets[roundInfo.currentLevel - 1].length) {
          stopTimer();
          gameStateObject.state = "finished";
        }
        if(!gameStateObject.resultsDrawn && gameStateObject.state === "finished") {
          drawResults();
          attachBackButtonEvents();
          attachNextButtonEvents();
        }
      }

      function loop(timestamp) {
        let progress = timestamp - lastRender;

        update(progress);
        draw();
        checkGameState();
        lastRender = timestamp;
        window.requestAnimationFrame(loop);
      }

      function loading() {
        drawBackground();
        context.Background.fillStyle = "#000";
        context.Background.font = "36px Verdana";
        context.Background.fillText("Wczytywanie", canvas.width / 2 - 100, canvas.height / 2 - 10);
      }

      function start() {
        window.requestAnimationFrame(loop);
      }

      window.addEventListener('load', function() {
        this.lastRender = 0;
        loading();
        setTimeout(start, 300);
      });
    })();