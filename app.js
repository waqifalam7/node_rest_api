const express = require("express");
// Set up the express app
const app = express();
const bodyParser = require('body-parser');

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const db =  [
    {
      	id: "order1",
  		itemId: "first",
  		quantity: 1,
    },
    {
      	id: "order2",
  		itemId: "second",
  		quantity: 1,
    },
];

let db1 =  [
    {
      	id: "first",
  		type: "shirt",
  		color: "red",
  		size: "S",
  		stock: 10,
    },
    {
      	id: "second",
  		type: "shirt",
  		color: "blue",
  		size: "M",
  		stock: 10,
    },
];
// get all todos
app.get('/items', (req, res) => {
  res.status(200).send({
    success: 'true',
    items: db1
  })
});

// get single todo
app.get('/item/:id', (req, res) => {
  const id = req.params.id;
  db1.map((item) => {
    if (item.id === id) {
      return res.status(200).send({
        success: 'true',
        item: item,
      });
    } 
});
 return res.status(404).send({
   success: 'false',
   message: 'Item could not be found',
  });
});

// get all orders
app.get('/orders', (req, res) => {
  res.status(200).send({
    success: 'true',
    orders: db
  })
});

// get single order
app.get('/order/:id', (req, res) => {
  const id = req.params.id;
  db.map((order) => {
    if (order.id === id) {
      return res.status(200).send({
        success: 'true',
        order: order,
      });
    } 
});
 return res.status(404).send({
   success: 'false',
   message: 'Order could not be found',
  });
});

function findOrder(db, idSearch) {
    for (var i = 0; i < db.length; i++) {
   		console.log(db[i].id + "-------" + idSearch);
        if (db[i].id == idSearch) {
            return(db[i]);
        }
    }
    return null;
}

// make order
app.post('/orders', (req, res) => {
	if(!req.body.itemId) {
		return res.status(400).send({
      		success: 'false',
      		message: 'Invalid request'
    	});
	}
	if(!req.body.quantity){
		return res.status(400).send({
      		success: 'false',
      		message: 'Invalid request'
    	});
	}
	if (isNaN(req.body.quantity)){
		return res.status(400).send({
      		success: 'false',
      		message: 'Invalid request'
    	});
	}

	var order = findOrder(db1, req.body.itemId);
	if (order == null){
		return res.status(400).send({
      		success: 'false',
      		message: 'Item could not be found'
    	});
	}

	if (order.stock < parseInt(req.body.quantity)){
		return res.status(400).send({
      		success: 'false',
      		message: 'Item does not have enough stock'
    	});
	}

  	db1.map((item) => {
    	if (item.id === req.body.itemId) {
    		item.stock = item.stock - parseInt(req.body.quantity);
    	}
    })

  	const neworder = {
  		id: makeid(5),
  		itemId: req.body.itemId,
  		quantity: parseInt(req.body.quantity),
 	};

 	db.push(neworder);

 	return res.status(201).send({
   		success: 'true',
   		order: neworder
 	})

});

// StackOverFlow random id generator
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// admin verification
// hard coded token verification
// NOT SUITABLE FOR PRODUCTION USE
function verify(req){
	if (!req.headers['authorization']){
		return false;
	}
	let token = req.headers['authorization'];

  	if (token.startsWith('Bearer ')) {
    	token = token.slice(7, token.length).trimLeft();
       	if (token == "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NjI1NzI0NjQsImV4cCI6MTU5NDEwODQ2OSwiYXVkIjoid3d3LnN0dWRlbnRzLjJoYXRzLmNvbS5hdSIsInN1YiI6InVzZXJAMmhhdHMuY29tLmF1IiwiR2l2ZW5OYW1lIjoiSm9obiIsIlN1cm5hbWUiOiJTbm93IiwiRW1haWwiOiJqb2huc25vd0AyaGF0cy5jb20uYXUiLCJSb2xlIjoiSmFuaXRvciJ9.BEEqb2ihfP0ec8TBu91T9lk0kcBKpz1NkJv4PpyjxdE"){
    		return true;
    	}
  	}
  	return false;
}

app.get('/check', (req, res) => {
	if (verify(req)){
		res.status(200).send({
    		success: 'true',
    		orders: db
  		})
	} else {
		res.status(200).send({
    		success: 'true',
    		orders: db1
  		})
	}
});

app.delete('/item/:id', (req, res) => {
  const id = req.params.id;
  if (!verify(req)){
  	return res.status(404).send({
      success: 'false',
      message: 'Unauthorized',
    });
  }
  db1.map((item, index) => {
  	console.log(item.id + "-----" + id);
    if (item.id === id) {
       db1.splice(index, 1);
       return res.status(200).send({
         success: 'true',
       });
    }
  });


    return res.status(404).send({
      success: 'false',
      message: 'Item could not be found',
    });
});

app.patch('/item/:id', function (req, res) {
	if (!verify(req)){
  		return res.status(404).send({
      		success: 'false',
      		message: 'Unauthorized',
    	});
  	}
  	if (!req.body.stock || isNaN(req.body.stock)){
	  	return res.status(404).send({
	      success: 'false',
	      message: 'Invalid Request',
	    });
  	}
    var stock = parseInt(req.body.stock); // {last_name : "smith", age: 44}
    var id = req.params.id;
    db1.map((item) => {
    	if (item.id === id) {
    		item.stock = item.stock + stock;
    		return res.status(200).send({
         		success: 'true',
       		});
    	}
    })

    return res.status(404).send({
      success: 'false',
      message: 'Cannot find item',
    });
});

app.post('/items', (req, res) => {
	if (!verify(req)){
		return res.status(404).send({
      		success: 'false',
      		message: 'Unauthorized',
    	});
	}

	if (!req.body.items){
		console.log(req.body);
		return res.status(404).send({
	      success: 'false',
	      message: 'Invalid Request',
	    });
	}
	var s = req.body.items;
	var arr = eval('(' + s + ')');
	for (i in arr)
	{
		console.log(arr[i]);
	   	db1.push(arr[i]);
	}

	return res.status(200).send({
        success: 'true',
    });
});


const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
