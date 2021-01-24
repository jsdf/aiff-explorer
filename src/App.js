import './styles.css';
import * as AIFF from './aiff';
import {useState, useCallback} from 'react';

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', () => {
      reject(reader.error);
    });
  });
}

const boxStyle = {
  border: 'solid 1px black',
};
const textStyle = {
  margin: '8px 8px',
  wordWrap: 'break-word',
};

function DisplayObject({object}) {
  return (
    <div style={{...boxStyle, margin: '8px 0px'}}>
      {Object.keys(object).map((key) => {
        if (object[key] && typeof object[key] === 'object') {
          if (typeof object[key].length === 'number') {
            return (
              <div key={key} style={textStyle}>
                {key}:{' '}
                {typeof object[key].length === 'number' ? (
                  `Buffer {size: ${object[key].length}}`
                ) : (
                  <DisplayObject object={object[key]} />
                )}
              </div>
            );
          }
          return (
            <div key={key} style={textStyle}>
              {key}: <DisplayObject object={object[key]} />
            </div>
          );
        }
        return (
          <div key={key} style={textStyle}>
            {key}: {JSON.stringify(object[key])}
          </div>
        );
      })}
    </div>
  );
}

function AiffChunk({chunk}) {
  const {ckID, ckSize, localChunks} = chunk;
  let chunkSpecificData = chunk.parsed;
  if (ckID === 'FORM') {
    chunkSpecificData = {formType: chunk.form};
  }

  return (
    <div style={{...boxStyle, margin: '8px 0px'}}>
      <div style={textStyle}>chunk ID: {ckID}</div>
      <div style={textStyle}>chunk size: {ckSize}</div>
      {chunkSpecificData && (
        <div style={textStyle}>
          {ckID} fields:{' '}
          {typeof chunkSpecificData === 'object' ? (
            <DisplayObject object={chunkSpecificData} />
          ) : (
            JSON.stringify(chunkSpecificData)
          )}
        </div>
      )}
      {localChunks && (
        <div style={textStyle}>
          local chunks:
          {localChunks.map((lchunk, i) => (
            <AiffChunk key={i} chunk={lchunk} />
          ))}
        </div>
      )}
      <div style={{...textStyle, fontSize: '0.8em', color: '#777'}}>
        end {ckID} chunk
      </div>
    </div>
  );
}

export default function App() {
  const [aiff, setAiff] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = useCallback(async function handleFiles(e) {
    const fileList =
      e.currentTarget.files; /* now you can work with the file list */

    const data = await readFile(fileList[0]);
    try {
      setAiff(AIFF.parse(new Buffer(data)));
    } catch (err) {
      setError(err);
    }
  }, []);

  return (
    <div className="App">
      <h1>AIFF explorer</h1>
      <div>
        <p>This tool visualizes the chunks in an AIFF file.</p>
        <input type="file" id="input" onChange={handleFiles} />
      </div>

      {error && <pre>{error.toString() + '\n' + error.stack}</pre>}
      {aiff &&
        aiff.fileChunks.map((chunk, i) => <AiffChunk key={i} chunk={chunk} />)}
    </div>
  );
}
