from app.integrations.yuzid import CompareFaceRequest, CompareFaceResponse, YuzIdClient

_client = YuzIdClient()


async def compare_face(request: CompareFaceRequest) -> CompareFaceResponse:
    return await _client.compare_face(request)
