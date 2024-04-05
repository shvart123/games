
// ------------------------------------------------------------------------

// Вызов функции при загрузки окна
window.onload = function() 
{
    // Get the canvas and context
    let canvas = document.getElementById("viewport");
    let context = canvas.getContext("2d");
    
    let seconds = 0;
let minutes = 3;
let newminutes=0;

let score2= 600;
let hours = 0;
let fer=":";
let interval;
let levels=1;
    let lastframe = 0;
    let fpstime = 0;
    let framecount = 0;
    let fps = 0;
   
    let drag = false;
    
    let level = {
        x: 250,         // X position
        y: 113,         // Y position
        columns: 7,     // Number of tile columns
        rows: 7,        // Number of tile rows
        tilewidth: 60,  // Visual width of a tile
        tileheight: 60, // Visual height of a tile
        tiles: [],      // The two-dimensional tile array
        selectedtile: { selected: false, column: 0, row: 0 }
    };
    
    // Цвета для квадратов
    let tilecolors = [[153, 0, 0],
                     [0, 102, 0],
                      [0, 0, 255],
                     [255, 102, 0],
                      [102, 0, 204],
                     [128, 255, 255],
                      [255, 255, 255]];
    
  
    let clusters = [];  // { column, row, length, horizontal }
    let moves = [];     // { column1, row1, column2, row2 }

 
    let currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };
    
    // начало игры
    let gamestates = { init: 0, ready: 1, resolve: 2 };
    let gamestate = gamestates.init;
    
    // очки
    let score = 0;
     let time = 10;
    
    // анимация
    let animationstate = 0;
    let animationtime = 0;
    let animationtimetotal = 0.2;
    
    // показать ходы
    let showmoves = false;
    
    // авто игра
    let aibot = false;
    
    
    let gameover = false;
    let timeout=false;
    let nextlevels=false;
    
    // Кнопки
    let buttons = [ { x: 30, y: 625, width: 150, height: 50, text: "Новая игра"},
                    { x: 300, y: 625, width: 150, height: 50, text: "Показать ход"},
                    { x: 570, y: 625, width: 200, height: 50, text: "Автоигра"},
                  { x: 20, y: 425, width: 200, height: 50, text: "Next level"}
                  

                    ];
    

   

    // инициализация
    function init() {
        clearInterval(interval);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);
        
        // Initialize the two-dimensional tile array
        for (let i=0; i<level.columns; i++) {
            level.tiles[i] = [];
            for (let j=0; j<level.rows; j++) {
                // Define a tile type and a shift parameter for animation
                level.tiles[i][j] = { type: 0, shift:0 }
            }
        }
        
        // Новая игра
        newGame();
        
    
        main(0);
    }
    
 

 function updateTime() {

   seconds--;
  if ( minutes === 0 && seconds === 0 ) {

 clearInterval(interval);

timeout=true;
seconds= 0;
    minutes = 0;
    aibot=false;
    buttons[2].text=("Автоигра");
  }
 
  if(seconds === -1)
  {
    minutes--;
    seconds = 0;
    seconds=59;
  }
 
}
   

function timer()
{
interval = setInterval(updateTime, 1000);
  
}

    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);
        
        // Update and render the game
        update(tframe);
        render();
    }

    
    // Обновление статуса игры
    function update(tframe)
     {
        
        let dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        // обновление fps
        updateFps(dt);
        
        if (gamestate == gamestates.ready) {
            
            
            // ели нет ходов получаем game over
            if (moves.length <= 0) {
                gameover = true;
            }
            
            // автоигра
            if (aibot) {
                animationtime += dt;
                if (animationtime > animationtimetotal) {
                    // Поиск ходов
                    findMoves();
                    
                    if (moves.length > 0) {
                        // получаем рандомные ходы 
                        let move = moves[Math.floor(Math.random() * moves.length)];
                        
                        
                        mouseSwap(move.column1, move.row1, move.column2, move.row2);
                    } else {
                        aibot=false;
                         buttons[2].text = (aibot?"Выключить Авто":"Автоигра"); 
                         clearInterval(interval);
                        
                        // newGame();
                    }
                    animationtime = 0;
                }
            }
        } else if (gamestate == gamestates.resolve) {
            
            animationtime += dt;
            
            if (animationstate == 0) {
                
                if (animationtime > animationtimetotal) {
                    
                    findClusters();
                    
                    if (clusters.length > 0) {
                      
                        for (let i=0; i<clusters.length; i++) {
                            // Add extra points for longer clusters
                            score += 100 * (clusters[i].length - 2);;
                            if (score > 2*score2)
                        {
                            score2=score;
                            nextlevels=true;
                        aibot=false;
                            levels++;
                           // nextGame();
                           
                     buttons[2].text = (aibot?"Выключить Автo":"Автоигра"); 

                        }
                        }

                      
                        removeClusters();
                        
                       
                        animationstate = 1;
                    } else {
                      
                        gamestate = gamestates.ready;
                    }
                    animationtime = 0;
                }
            } else if (animationstate == 1) {
               
                if (animationtime > animationtimetotal) {
                 
                    shiftTiles();
                    
                
                    animationstate = 0;
                    animationtime = 0;
                    
                  
                    findClusters();
                    if (clusters.length <= 0) {
                     
                        gamestate = gamestates.ready;
                    }
                }
            } else if (animationstate == 2) {
             
                if (animationtime > animationtimetotal) {
                    
                    swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);
                    
                  
                    findClusters();
                    if (clusters.length > 0) {
                        
                        animationstate = 0;
                        animationtime = 0;
                        gamestate = gamestates.resolve;
                    } else {
                      
                        animationstate = 3;
                        animationtime = 0;
                    }
                    
                   
                    findMoves();
                    findClusters();
                }
            } else if (animationstate == 3) {
              
                if (animationtime > animationtimetotal) {
                  
                    swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);
                    
                  
                    gamestate = gamestates.ready;
                }
            }
            
           
            findMoves();
            findClusters();
        }


    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);
            
            
            fpstime = 0;
            framecount = 0;
        }
        
       
        fpstime += dt;
        framecount++;
    }
    
    
    function drawCenterText(text, x, y, width) {
        let textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
   
    function render() {
       
        drawFrame();
        drawFrame1();
        
        // Рисуем очки
        context.fillStyle = "white";
        context.font = "24px Verdana";
         drawCenterText(fer, 30, level.y-70, 1500);
        drawCenterText("Score:", 30, level.y+10, 110);
        drawCenterText(score, 30, level.y+60, 110);
     
        drawCenterText("Level", 30, level.y+200, 110);
        drawCenterText(levels, 30, level.y+250, 110);
     
        
         
         if (minutes< 1)
       
        {
            context.fillStyle = "red";
        }
         if (seconds<10)
         {
            drawCenterText( "0"+seconds, 30, level.y-70, 1550);
         }
         else 
         {
 drawCenterText(seconds, 30, level.y-70, 1550);
         }
         if(minutes<10)
{
   drawCenterText("0"+minutes, 30, level.y-70, 1450);  
}
       else
       {
        drawCenterText(minutes, 30, level.y-70, 1450);
       }

        
        drawButtons();
        
        
        let levelwidth = level.columns * level.tilewidth;
        let levelheight = level.rows * level.tileheight;
        context.fillStyle = "#000000";
        context.fillRect(level.x - 2, level.y - 2, levelwidth + 4, levelheight + 4);
        
       
        renderTiles();
        
      
        renderClusters();
        
       
        if (showmoves && clusters.length <= 0 && gamestate == gamestates.ready) {
            renderMoves();
        }
        
        // сообщение game over
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.9)";
            context.fillRect(level.x, level.y, levelwidth, levelheight);
            
            context.fillStyle = "#ffffff";
            context.font = "28px Verdana";
            drawCenterText("Game Over!", level.x, level.y + levelheight / 2 + 10, levelwidth);
        }

        if (timeout) {
            clearInterval(timeout);

            context.fillStyle = "rgba(0, 0, 0, 0.9)";
            context.fillRect(level.x, level.y, levelwidth, levelheight);
            
            context.fillStyle = "#ffffff";
            context.font = "28px Verdana";
            drawCenterText("Timeout!", level.x, level.y + levelheight / 2 + 10, levelwidth);
            aibot=false;
             
          
        }

         if (nextlevels) {
            clearInterval(interval);
            context.fillStyle = "rgba(0, 0, 0, 0.9)";
            context.fillRect(level.x, level.y, levelwidth, levelheight);
            
            context.fillStyle = "#ffffff";
            context.font = "28px Verdana";
            drawCenterText("You Winn !", level.x, level.y + levelheight / 2 + 10, levelwidth);
            for (let i=3; i<buttons.length; i++) {
            // Draw button shape
            context.fillStyle = "rgba(0, 0, 0, 0.9)";
            context.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
            
            // Draw button text
            context.fillStyle = "#ffffff";
            context.font = "20px Verdana";

            let textdim = context.measureText(buttons[i].text);
            context.fillText(buttons[i].text, buttons[i].x + (buttons[i].width-textdim.width)/2, buttons[i].y+30);

        }

        }
    }
    
   
    function drawFrame() {
       
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "gray ";
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);
        
        // шапка
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 65);

        
        // Цвет названия 
        context.fillStyle = "White";

        context.font = "28px Verdana";
        context.fillText(" Три в ряд", 380, 40);
        
        
    }
    function drawFrame1() {
        // Draw background and a border
       
        //низ
        context.fillStyle = "#303030";
        context.fillRect(0,620, canvas.width, 65);

        
    }
    
    // фон кнопок
    function drawButtons() {
        for (let i=0; i<buttons.length-1; i++) {
            // Draw button shape
            context.fillStyle = "rgba(0, 0, 0, 0.9)";
            context.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
            
            // Draw button text
            context.fillStyle = "#ffffff";
            context.font = "20px Verdana";

            let textdim = context.measureText(buttons[i].text);
            context.fillText(buttons[i].text, buttons[i].x + (buttons[i].width-textdim.width)/2, buttons[i].y+30);

        }
      
    }
    
    function renderTiles() {

        for (let i=0; i<level.columns; i++) {
            for (let j=0; j<level.rows; j++) {
                // Get the shift of the tile for animation
                let shift = level.tiles[i][j].shift;
                
                // Высчитываем координаты плиток
                let coord = getTileCoordinate(i, j, 0, (animationtime / animationtimetotal) * shift);
                
                
                if (level.tiles[i][j].type >= 0) {
                    
                    let col = tilecolors[level.tiles[i][j].type];
                    
                
                    drawTile(coord.tilex, coord.tiley, col[0], col[1], col[2]);
                }
                
               
                if (level.selectedtile.selected) {
                    if (level.selectedtile.column == i && level.selectedtile.row == j) {
                        // Draw a red tile
                        drawTile(coord.tilex, coord.tiley, 255, 220, 0);
                    }
                }
            }
        }
        
    
        if (gamestate == gamestates.resolve && (animationstate == 2 || animationstate == 3)) {
            
            let shiftx = currentmove.column2 - currentmove.column1;
            let shifty = currentmove.row2 - currentmove.row1;


            let coord1 = getTileCoordinate(currentmove.column1, currentmove.row1, 0, 0);
            let coord1shift = getTileCoordinate(currentmove.column1, currentmove.row1, (animationtime / animationtimetotal) * shiftx, (animationtime / animationtimetotal) * shifty);
            let col1 = tilecolors[level.tiles[currentmove.column1][currentmove.row1].type];
            
        
            let coord2 = getTileCoordinate(currentmove.column2, currentmove.row2, 0, 0);
            let coord2shift = getTileCoordinate(currentmove.column2, currentmove.row2, (animationtime / animationtimetotal) * -shiftx, (animationtime / animationtimetotal) * -shifty);
            let col2 = tilecolors[level.tiles[currentmove.column2][currentmove.row2].type];
            
            
            drawTile(coord1.tilex, coord1.tiley, 0, 0, 0);
            drawTile(coord2.tilex, coord2.tiley, 0, 0, 0);
            
            
            if (animationstate == 2) {
                // Draw the tiles
                drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
                drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
            } else {
                // Draw the tiles
                drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
                drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
            }
        }
    }
    
    // Получаем координаты плиток
    function getTileCoordinate(column, row, columnoffset, rowoffset) {
        let tilex = level.x + (column + columnoffset) * level.tilewidth;
        let tiley = level.y + (row + rowoffset) * level.tileheight;
        return { tilex: tilex, tiley: tiley};
    }
    
    
    function drawTile(x, y, r, g, b) {
        context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        context.fillRect(x + 2, y + 2, level.tilewidth - 4, level.tileheight - 4);
    }
    
    
    function renderClusters() {

        for (let i=0; i<clusters.length; i++) {
            // Calculate the tile coordinates
            let coord = getTileCoordinate(clusters[i].column, clusters[i].row, 0, 0);
            
            if (clusters[i].horizontal) {
                // горизантальные линии
                context.fillStyle = "rgba(0, 0, 0, 0.2";
                context.fillRect(coord.tilex + level.tilewidth/2, coord.tiley + level.tileheight/2 - 4, (clusters[i].length - 1) * level.tilewidth, 8);
            } else {
                // вертикальные линии
                context.fillStyle = "rgba(0, 0, 0, 0.2)";
                context.fillRect(coord.tilex + level.tilewidth/2 - 4, coord.tiley + level.tileheight/2, 8, (clusters[i].length - 1) * level.tileheight);
            }
        }
    }
    
    
    function renderMoves() {

        for (let i=0; i<moves.length; i++) {
    
            let coord1 = getTileCoordinate(moves[i].column1, moves[i].row1, 0, 0);
            let coord2 = getTileCoordinate(moves[i].column2, moves[i].row2, 0, 0);
            
            
            context.strokeStyle = "red";
            context.beginPath();
            context.moveTo(coord1.tilex + level.tilewidth/2, coord1.tiley + level.tileheight/2);
            context.lineTo(coord2.tilex + level.tilewidth/2, coord2.tiley + level.tileheight/2);
            context.stroke();
        }
    }
    
    
    // новая игра
    function newGame() {
      
        // Reset score
        score = 0;
        levels=1;
       timer();
  
        // Set the gamestate to ready
        gamestate = gamestates.ready;
        
        // Reset game over
        gameover = false;
        timeout=false;
        // Create the level
        createLevel();
        
        // Find initial clusters and moves
        findMoves();
        findClusters(); 


    }
    function nextGame() {
      clearInterval(interval);
      newminutes=minutes;
        score = score2;
       minutes--;
       minutes=minutes+newminutes;
     //seconds=0;
       timer();
  
        // Set the gamestate to ready
        gamestate = gamestates.ready;
        
        // Reset game over
        gameover = false;
        timeout=false;
        
        

       createLevel();
        
        // Find initial clusters and moves
        findMoves();
        findClusters(); 


    }


    
    
    function createLevel() {
        let done = false;
        
        
        while (!done) {
        
            
            for (let i=0; i<level.columns; i++) {
                for (let j=0; j<level.rows; j++) {
                    level.tiles[i][j].type = getRandomTile();
                }
            }
            
        
            resolveClusters();
            
            
            findMoves();
            
        
            if (moves.length > 0) {
                done = true;
            }
        }
    }
    
    
    function getRandomTile() {
        return Math.floor(Math.random() * tilecolors.length);
    }
    
    
    function resolveClusters() {
    
        findClusters();
        

        while (clusters.length > 0) {
        
            
            removeClusters();
            
            
            shiftTiles();
            
            
            findClusters();
        }
    }
    
    
    function findClusters() {
        
        clusters = []
        
    
        for (let j=0; j<level.rows; j++) {
            
            let matchlength = 1;
            for (let i=0; i<level.columns; i++) {
                let checkcluster = false;
                
                if (i == level.columns-1) {
        
                    checkcluster = true;
                } else {
                
                    if (level.tiles[i][j].type == level.tiles[i+1][j].type &&
                        level.tiles[i][j].type != -1) {
                        
                        matchlength += 1;
                    } else {
                        
                        checkcluster = true;
                    }
                }
               
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // поиск по горизантали
                        clusters.push({ column: i+1-matchlength, row:j,
                                        length: matchlength, horizontal: true });
                    }
                    
                    matchlength = 1;
                }
            }
        }

        // поиск по вертикали
        for (let i=0; i<level.columns; i++) {
            // Start with a single tile, cluster of 1
            let matchlength = 1;
            for (let j=0; j<level.rows; j++) {
                let checkcluster = false;
                
                if (j == level.rows-1) {
                
                    checkcluster = true;
                } else {
                    
                    if (level.tiles[i][j].type == level.tiles[i][j+1].type &&
                        level.tiles[i][j].type != -1) {
                        
                        matchlength += 1;
                    } else {
                        
                        checkcluster = true;
                    }
                }
                
            
                if (checkcluster) {
                    if (matchlength >= 3) {
                        
                        clusters.push({ column: i, row:j+1-matchlength,
                                        length: matchlength, horizontal: false });
                    }
                    
                    matchlength = 1;
                }
            }
        }
    }
    
    // поиск ходов
    function findMoves() {
        // Reset moves
        moves = []
        
        // выбор по горизотали
        for (let j=0; j<level.rows; j++) {
            for (let i=0; i<level.columns-1; i++) {
                
                swap(i, j, i+1, j);
                findClusters();
                swap(i, j, i+1, j);
                
                
                if (clusters.length > 0) {
                    
                    moves.push({column1: i, row1: j, column2: i+1, row2: j});
                }
            }
        }
        
        
        for (let i=0; i<level.columns; i++) {
            for (let j=0; j<level.rows-1; j++) {
               
                swap(i, j, i, j+1);
                findClusters();
                swap(i, j, i, j+1);
                
                // Check if the swap made a cluster
                if (clusters.length > 0) {
                    // Found a move
                    moves.push({column1: i, row1: j, column2: i, row2: j+1});
                }
            }
        }
        
       
        clusters = []
    }
    
    
    function loopClusters(func) {
        for (let i=0; i<clusters.length; i++) {
            
            let cluster = clusters[i];
            let coffset = 0;
            let roffset = 0;
            for (let j=0; j<cluster.length; j++) {
                func(i, cluster.column+coffset, cluster.row+roffset, cluster);
                
                if (cluster.horizontal) {
                    coffset++;
                } else {
                    roffset++;
                }
            }
        }
    }
    
    // Удаляем плитки
    function removeClusters() {
        // Change the type of the tiles to -1, indicating a removed tile
        loopClusters(function(index, column, row, cluster) { level.tiles[column][row].type = -1; });

        
        for (let i=0; i<level.columns; i++) {
            let shift = 0;
            for (let j=level.rows-1; j>=0; j--) {
                
                if (level.tiles[i][j].type == -1) {
                    
                    shift++;
                    level.tiles[i][j].shift = 0;
                } else {
            
                    level.tiles[i][j].shift = shift;
                }
            }
        }
    }
    
   
    function shiftTiles() {
    
        for (let i=0; i<level.columns; i++) {
            for (let j=level.rows-1; j>=0; j--) {
                
                if (level.tiles[i][j].type == -1) {
                    // Заполняем плитками пустые места
                    level.tiles[i][j].type = getRandomTile();
                } else {
                    
                    let shift = level.tiles[i][j].shift;
                    if (shift > 0) {
                        swap(i, j, i, j+shift)
                    }
                }
                
            
                level.tiles[i][j].shift = 0;
            }
        }
    }
    
    
    function getMouseTile(pos) {
        
        let tx = Math.floor((pos.x - level.x) / level.tilewidth);
        let ty = Math.floor((pos.y - level.y) / level.tileheight);
        
        
        if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
        
            return {
                valid: true,
                x: tx,
                y: ty
            };
        }
        
    
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }
    
    
    function canSwap(x1, y1, x2, y2) {
        // Check if the tile is a direct neighbor of the selected tile
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
            (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }
        
        return false;
    }
    
    
    function swap(x1, y1, x2, y2) {
        let typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;
    }
    
    
    function mouseSwap(c1, r1, c2, r2) {
        
        currentmove = {column1: c1, row1: r1, column2: c2, row2: r2};
    
        level.selectedtile.selected = false;
        
        // запускаем пнимацию
        animationstate = 2;
        animationtime = 0;
        gamestate = gamestates.resolve;
    }
    
    
    function onMouseMove(e) {
        // получаем позицию курсора
        let pos = getMousePos(canvas, e);
        
        
        if (drag && level.selectedtile.selected) {
            
            mt = getMouseTile(pos);
            if (mt.valid) {
                
                if (canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)){
                    // Swap the tiles
                    mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                }
            }
        }
    }
    
    
    function onMouseDown(e) {
      
        let pos = getMousePos(canvas, e);
        
      
        if (!drag) {
           
            mt = getMouseTile(pos);
            
            if (mt.valid) {
                
                let swapped = false;
                if (level.selectedtile.selected) {
                    if (mt.x == level.selectedtile.column && mt.y == level.selectedtile.row) {
                      
                        level.selectedtile.selected = false;
                        drag = true;
                        return;
                    } else if (canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)){
                       
                        mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                        swapped = true;
                    }
                }
                
                if (!swapped) {
                   
                    level.selectedtile.column = mt.x;
                    level.selectedtile.row = mt.y;
                    level.selectedtile.selected = true;
                }
            } else {
               
                level.selectedtile.selected = false;
            }

           
            drag = true;
        }
        
       
        for (let i=0; i<buttons.length; i++) {
            if (pos.x >= buttons[i].x && pos.x < buttons[i].x+buttons[i].width &&
                pos.y >= buttons[i].y && pos.y < buttons[i].y+buttons[i].height) {
                
                // кнопки
                 // 
                if (i == 0) {
            clearInterval(interval);
                 minutes= 3;
                  seconds=0;
                   // Новая игра
                    newGame();
                } else if (i == 1) {
                    // Показать ходы
                    showmoves = !showmoves;
                    buttons[i].text = (showmoves?"Скрыть":"Показать") + " Ход";
                } else if (i == 2) {
                    // Автоигра
                    aibot = !aibot;
                    buttons[i].text = (aibot?"Выключить Авто":"Автоигра");
                }
                else if (i == 3) {
                    nextGame();
                    nextlevels=false;
                    

                }
            }
        }
    }
    
    function onMouseUp(e) {
      
        drag = false;
    }
    
    function onMouseOut(e) {
        
        drag = false;
    }
    
   
    function getMousePos(canvas, e) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
 
    init();

};
