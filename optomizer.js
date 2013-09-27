var path = process.argv[2];
var chokidar = require( 'chokidar' );
var watcher = chokidar.watch( path, {
	ignoreInitial: true,
	persistent: true
} );

watcher
	.on( 'add', function( path, stats ){
		if( Optomizer.isSquashable( path, stats ) ){
			console.log( 'File', path, 'has been added. Attempting squash...' );
			Optomizer.squash( path, stats );
		}
	} )
	.on( 'change', function( path, stats ){
		console.log( 'File', path, 'changed size to', stats.size );
	} )
	.on( 'unlink', function( path ){ console.log( 'File', path, 'has been removed' ); } )
	.on( 'error', function( error ){ console.error( 'Error happened', error ); } )

// Only needed if watching is persistent.
watcher.close();

Optomizer = function(){
	return {
		isSquashable : function( path, stats ){
			var perms = this.decodePerms( stats );
			var writable = ( parseInt( perms ) & 2 ) ? true : false;
			if( !writable ) return false;
			if( !stats.isFile() ) return false;
			if( /\.(jpg|png|jpeg)$/i.test( path ) ) return true;

			return false;
		},

		squash : function( path, stats ){
			var child;
			var exec = require('child_process').exec;

			console.log( path );
			if( path && this.isSquashable( path, stats ) ){
				var command = 'echo "' + path + '" | imageOptim -a';
				child = exec( command, function( error, stdout, stderr ){
					console.log( 'stdout:', stdout );

					if( stderr !== null && stderr != '' )
						console.log( 'stderr:', stderr );

					if( error !== null )
						console.log('exec error:', error );

				});
			} else {
				console.log( "Can't squash" );
			}
		},

		decodePerms : function( stats ){
			var intPerms = parseInt( stats.mode.toString( 8 ), 10 );
			var strPerms = "" + intPerms;
			return parseInt( strPerms.slice( strPerms.length - 3, strPerms.length - 2 ) );
		}

	}
}();