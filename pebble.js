simply.on('singleClick', function(e) {
  initShock();
});


function initShock() {
  ajax(
    { url: 'http://10.0.0.6:3000/shock', cache: false },
    function(data){
      console.log('shock');
    },
    function(err){
      console.log(err);
    }
  );
  
  simply.vibe('short');
  simply.setText({
    body: '##SHOCK##'
  });
  
  setTimeout(defaultText, 5000);
}

function defaultText() {
  simply.setText({
    title: 'Electric Monkey',
    body: 'Press buttons or tap to shock!',
  }, true);
}

defaultText();
