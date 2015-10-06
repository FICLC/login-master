function onFileButtonClicked() { 
  $('#url-input-group').css('visibility', 'hidden');
}

function onFilesSelected(event) {
	if (event.target.files.length == 2) {
    var files = [];
    // convert to array
    var fileList = event.target.files;

    // check for supported file types
    var fileType0 = /[^.]+$/.exec(event.target.files[0].name)[0];
    var fileType1 = /[^.]+$/.exec(event.target.files[1].name)[0];
    if (fileType0 == 'gz' || fileType1 == 'gz') { alert( 'Unzip .gz file to and use the .fasta or .fastq file');return}
    else {
      if (fileType0 != 'fastq' & fileType0 != 'fq' & fileType0 != 'fasta' & fileType0 != 'fas' & fileType0 != 'fa') { alert('file must be a fasta or fastq file'); return; }
      if (fileType1 != 'fastq' & fileType1 != 'fq' & fileType1 != 'fasta' & fileType1 != 'fas' & fileType1 != 'fa') { alert('file must be a fasta or fastq file'); return; }
    }
    
    for (var i=0; i < fileList.length; i++) { files.push(fileList[i]);}
    // analyze
		goFile(files)
	
	} else if (event.target.files.length == 1) {
		// read fastq
		var fileType0 = /[^.]+$/.exec(event.target.files[0].name)[0];    
     if (fileType0 == 'gz') { alert( 'Unzip .gz file to and use the .fasta or .fastq file'); return}
    else {
		  if (fileType0 != 'fastq' & fileType0 != 'fq' & fileType0 != 'fasta' & fileType0 != 'fas' & fileType0 != 'fa') { alert('file must be a fasta or fastq file'); return; }
    }
		var file = event.target.files[0];
		goFile([file]);
	} else {
		alert('select 1 fastq/fasta file or 2 fastq/fasta files that are mate pairs')
	}
}

function onUrlEntered() {

  // Grab the url here
  var url = $('#url-input').val();

  $('#url-input-group').css('visibility', 'hidden');

  // stream your file here
  goUrl(url);
  window.history.pushState({'index.html' : 'bar'},null,"?url=" + url);
  // window.location.search = 'url=' + url;
}

function onSraEntered() {

  // Grab the url here
  var sra_id = $('#sra-input').val();

  $('#sra-input-group').css('display', 'none');

  // stream your file here
  goSra(sra_id);
  window.history.pushState({'index.html' : 'bar'},null,"?sra=" + sra_id);
  // window.location.search = 'url=' + url;
}

function onSampleUrlEntered(url) {
  $('#url-input-group').css('display', 'none');

  // stream your file here
  goUrl(url);
  window.history.pushState({'index.html' : 'bar'},null,"?url=" + url);
  //window.location.search = 'url=' + url;
}

function displayUrlBox() {
  $('.input-group').css('display', 'none');
  $('#url-input-group').css('display', 'block');
  $("#url-input").focus();

}

function displaySraBox() {
  $('.input-group').css('display', 'none');
  $('#sra-input-group').css('display', 'block');
  $("#sra-input").focus();

}

var generateUid = function (separator) {
    /// <summary>
    ///    Creates a unique id for identification purposes.
    /// </summary>
    /// <param name="separator" type="String" optional="true">
    /// The optional separator for grouping the generated segmants: default "-".    
    /// </param>

    var delim = separator || "-";

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
};